import { IncomingMessage, ServerResponse } from "node:http";

import { ConfigService } from "@nestjs/config";
import { Params } from "nestjs-pino";
import { LevelWithSilent } from "pino";
import { Options } from "pino-http";

import { Enviroment } from "../config/env.validation";
// Por ruta directa y no desde el barrel `@/infrastructure`: ese índice exporta
// también este archivo, así que importarlo desde ahí sería una dependencia
// circular con el módulo a medio construir.
import { RequestWithId, resolveRequestId } from "../http/request-id.middleware";



/**
 * Nombre de la propiedad que lleva el identificador de la petición en cada
 * línea de log. Es el MISMO valor que viaja en el header `X-Request-Id` y que
 * el filtro de excepciones devuelve en el cuerpo como `traceId`; se llama
 * igual en los tres sitios para que buscarlo sea un solo grep.
 */
const TRACE_ID_KEY = 'traceId';


/**
 * En desarrollo interesa ver el detalle (`debug`); en producción esas líneas
 * son ruido y coste. No se fija `LOG_LEVEL` en el `.env` por defecto para que
 * el entorno decida solo, pero definirlo gana siempre.
 */
const defaultLevel = (environment: Enviroment): LevelWithSilent =>
    environment === Enviroment.Development ? 'debug' : 'info';


/**
 * Identificador de la petición para pino.
 *
 * NO genera uno nuevo: reutiliza el que `requestIdMiddleware` ya puso al
 * entrar la petición. Si pino fabricara el suyo habría dos identificadores
 * distintos para la misma petición —uno en el log y otro en el header y en el
 * cuerpo del error— y la correlación, que es justo el objetivo, no existiría.
 *
 * El respaldo cubre el caso de que este logger se monte sin ese middleware
 * delante: entonces resuelve el identificador igual que él y lo deja escrito
 * en la petición, para que el filtro de excepciones encuentre el mismo valor.
 */
const genReqId = (req: IncomingMessage): string => {
    const request = req as unknown as RequestWithId;

    request.requestId ??= resolveRequestId(request.headers['x-request-id']);

    return request.requestId;
};


/**
 * Mensaje de la petición terminada.
 *
 * El de `pino-http` es "request completed", que no dice ni la ruta ni el
 * estado: obliga a abrir el objeto para saber qué pasó. Este se lee de un
 * vistazo mientras corre la consola.
 *
 * Solo ASCII, a propósito. Una flecha `→` o un punto medio `·` son UTF-8 de
 * varios bytes y la consola de Windows, que por defecto no va en UTF-8, los
 * pinta como `ÔåÆ` y `ÂÀ`. El log lo lee gente en terminales que no controlamos:
 * tiene que verse igual en todas.
 */
const requestMessage = (req: IncomingMessage, res: ServerResponse, responseTimeMs: number): string =>
    `${req.method ?? '?'} ${req.url ?? '?'} -> ${res.statusCode} | ${responseTimeMs} ms`;


/**
 * Mensaje de la petición que terminó con un error colgando de la respuesta.
 *
 * Va sin duración a propósito: `pino-http` no se la pasa a este callback, y
 * escribir un `0 ms` inventado sería peor que no decir nada.
 */
const requestErrorMessage = (req: IncomingMessage, res: ServerResponse, error: Error): string =>
    `${req.method ?? '?'} ${req.url ?? '?'} -> ${res.statusCode} | ${error.name}`;


/**
 * Nivel de la línea que cierra la petición, según cómo terminó.
 *
 * Por defecto `pino-http` lo escribe todo en `info`, así que una petición que
 * revienta con un 500 quedaba al mismo nivel que una que fue bien: con
 * `LOG_LEVEL=warn` en producción no se veía ninguna de las dos.
 *
 * Esta línea NO repite el error: dice cómo terminó la petición y cuánto tardó.
 * El volcado del fallo —stack, query, driverError— lo escribe una sola vez
 * `AllExceptionsFilter`, y las dos líneas se cruzan por el `traceId`.
 */
const requestLevel = (_req: IncomingMessage, res: ServerResponse, error?: Error): LevelWithSilent => {
    if (error !== undefined || res.statusCode >= 500) {
        return 'error';
    };

    return res.statusCode >= 400 ? 'warn' : 'info';
};


/**
 * Consola legible para desarrollo. En producción NO se usa: allí la salida es
 * JSON por línea, que es lo que un agregador (Loki, Datadog, CloudWatch) sabe
 * indexar.
 *
 * `messageFormat` sube el `traceId` y el contexto a la propia línea del
 * mensaje, y `ignore` los quita del objeto de abajo para no imprimirlos dos
 * veces. Queda: `14:03:22.123 INFO (a1b2c3d4e5f6) [AuthController] mensaje`.
 *
 * `req`, `res` y `responseTime` también se ocultan AQUÍ, no en el logger: el
 * mensaje ya dice método, ruta, estado y duración, así que en consola son la
 * misma información ocupando seis líneas. En producción siguen saliendo, que
 * es donde importan: ahí son campos que el agregador indexa y filtra.
 */
const PRETTY_TRANSPORT = {
    target: 'pino-pretty',
    options: {
        colorize: true,
        translateTime: 'SYS:HH:MM:ss.l',
        messageFormat: `{if ${TRACE_ID_KEY}}({${TRACE_ID_KEY}}) {end}{if context}[{context}] {end}{msg}`,
        ignore: `pid,hostname,context,${TRACE_ID_KEY},req,res,responseTime`,
    },
};


/**
 * Configuración de `nestjs-pino` para toda la aplicación.
 *
 * `quietReqLogger` junto con el renombre de `reqId`: cada línea escrita
 * durante una petición —la del propio ciclo HTTP, pero también las de los
 * casos de uso, los handlers de eventos y el filtro de excepciones— sale con
 * `traceId` y nada más del request. El detalle de la petición (método, ruta,
 * estado, duración) va UNA sola vez, en la línea de cierre; repetirlo en cada
 * línea intermedia haría la consola ilegible.
 */
export const buildLoggerParams = (configService: ConfigService): Params => {
    const environment = configService.getOrThrow<Enviroment>('NODE_ENV');
    const level = configService.get<LevelWithSilent>('LOG_LEVEL') ?? defaultLevel(environment);

    const pinoHttp: Options = {
        level,
        genReqId,
        quietReqLogger: true,
        customAttributeKeys: { reqId: TRACE_ID_KEY },
        customLogLevel: requestLevel,
        customSuccessMessage: requestMessage,
        customErrorMessage: requestErrorMessage,

        /**
         * Serializadores recortados a lo imprescindible. Los de serie vuelcan
         * los headers completos, y ahí viaja el `Authorization`: un token de
         * acceso en la consola es una credencial filtrada.
         */
        serializers: {
            req: (req: IncomingMessage) => ({ method: req.method, url: req.url }),
            res: (res: ServerResponse) => ({ statusCode: res.statusCode }),
        },

        ...(environment === Enviroment.Development ? { transport: PRETTY_TRANSPORT } : {}),
    };

    return { pinoHttp };
};
