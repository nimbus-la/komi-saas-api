import { IncomingMessage, ServerResponse } from "node:http";

import { Params } from "nestjs-pino";
import { stdTimeFunctions } from "pino";
import { Options } from "pino-http";

import type { AuthenticatedUser } from "@/auth/infrastructure/types";
import { LoggingConfig } from "@/interfaces";

// Por ruta directa y no desde el barrel `@/infrastructure`: ese índice exporta
// también este archivo, así que importarlo desde ahí sería una dependencia
// circular con el módulo a medio construir.
import { RequestWithId, resolveRequestId } from "../http/request-id.middleware";
import { REDACTED, sanitize } from "./sanitizer.util";



/**
 * Nombre de la propiedad que lleva el identificador de la petición en cada
 * línea de log. Es el MISMO valor que viaja en el header `X-Request-Id` y que
 * el filtro de excepciones devuelve en el cuerpo como `traceId`; se llama
 * igual en los tres sitios para que buscarlo sea un solo grep.
 */
const TRACE_ID_KEY = 'traceId';


/**
 * La petición con lo que le van colgando por el camino: lo que parseó Express
 * y el usuario que resolvió `JwtAuthGuard`.
 *
 * El tipo de `AuthenticatedUser` se importa en vez de redeclararlo aquí: si
 * mañana ese payload cambia de forma, esto tiene que dejar de compilar, no
 * seguir escribiendo un `tenantId` que ya no existe. Es `import type`, así que
 * no crea ninguna dependencia real de infraestructura hacia auth.
 */
type LoggedRequest = IncomingMessage & {
    user?: AuthenticatedUser;
    body?: unknown;
    query?: unknown;
    params?: unknown;
    originalUrl?: string;
    ip?: string;
};


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


/** La ruta completa, aunque un router la haya reescrito por el camino. */
const urlOf = (req: IncomingMessage): string =>
    (req as LoggedRequest).originalUrl ?? req.url ?? '?';


/**
 * Mensaje de la petición TERMINADA: `POST /auth/login -> 401`.
 *
 * Solo ASCII, a propósito. Una flecha `→` es UTF-8 de varios bytes y la
 * consola de Windows, que por defecto no va en UTF-8, la pinta como `ÔåÆ`. El
 * log lo lee gente en terminales que no controlamos: tiene que verse igual en
 * todas. La duración no va aquí, sino en el campo `responseTime`.
 */
const requestMessage = (req: IncomingMessage, res: ServerResponse): string =>
    `${req.method ?? '?'} ${urlOf(req)} -> ${res.statusCode}`;


/**
 * Mensaje de la petición que ENTRA: `--> POST /auth/login`.
 *
 * Solo en desarrollo. Si el proceso se cae a la mitad —o se queda colgado— esta
 * línea es la única constancia de qué petición y con qué cuerpo lo provocó: la
 * de cierre nunca llegaría a escribirse. En producción se calla porque
 * duplicaría cada petición del log.
 *
 * El `-->` es toda la marca de inicio que lleva. Se probó abrir con una regla
 * de guiones para separar peticiones y quedaba peor: `pino-pretty` escribe el
 * mensaje detrás del nivel, así que la regla se llevaba la línea del timestamp
 * y dejaba el `-->` suelto debajo.
 */
const receivedMessage = (req: IncomingMessage): string =>
    `--> ${req.method ?? '?'} ${urlOf(req)}`;


/**
 * Nivel de la línea que cierra la petición, según cómo terminó.
 *
 * Por defecto `pino-http` lo escribe todo en `info`, así que una petición que
 * revienta con un 500 quedaba al mismo nivel que una que fue bien: con
 * `LOG_LEVEL=warn` en producción no se veía ninguna de las dos.
 */
const requestLevel = (_req: IncomingMessage, res: ServerResponse, error?: Error): 'error' | 'warn' | 'info' => {
    if (error !== undefined || res.statusCode >= 500) {
        return 'error';
    };

    return res.statusCode >= 400 ? 'warn' : 'info';
};


/**
 * Con qué llegó la petición: cuerpo, query string y parámetros de ruta.
 *
 * Los tres juntos, porque los tres hacen falta para reproducir un fallo: un
 * `PATCH /branch/:id?force=true` no se rehace solo con el cuerpo.
 *
 * Devuelve un objeto vacío si no hay nada que registrar, para no arrastrar un
 * `payload: {}` en cada lectura.
 */
const payloadOf = (req: IncomingMessage, includeParams: boolean): object => {
    const { body, query, params } = req as LoggedRequest;

    const payload = {
        // Los parámetros de ruta no existen hasta que Express empareja la ruta:
        // al ENTRAR la petición lo que hay ahí son restos internos del router.
        ...(includeParams && isPresent(params) ? { params: sanitize(params) } : {}),
        ...(isPresent(query) ? { query: sanitize(query) } : {}),
        ...(isPresent(body) ? { body: sanitize(body) } : {}),
    };

    return Object.keys(payload).length > 0 ? { payload } : {};
};


/** Descarta lo que no aporta: nulo, indefinido u objeto sin claves. */
const isPresent = (value: unknown): boolean => {
    if (value === null || value === undefined) {
        return false;
    };

    if (typeof value === 'object' && !Array.isArray(value)) {
        return Object.keys(value).length > 0;
    };

    return true;
};


/** La IP del cliente, mire Express o el socket. */
const ipOf = (req: IncomingMessage): string | undefined =>
    (req as LoggedRequest).ip ?? req.socket?.remoteAddress;


/**
 * Quién hizo la petición, del token que ya validó `JwtAuthGuard`.
 *
 * Solo se sabe al CERRAR: cuando la petición entra, el guard todavía no ha
 * corrido. Con esto, "algo raro pasó con el inventario del negocio 42" se
 * convierte en un filtro por `tenantId` en vez de en una lectura de todo el log.
 *
 * NO se registra el `sessionId`: identifica una sesión viva y no hace falta
 * para diagnosticar nada.
 */
const businessContext = (req: IncomingMessage): object => {
    const { user } = req as LoggedRequest;

    if (user === undefined) {
        return {};
    };

    return {
        tenantId: user.tenantId,
        userId: user.userId,
        branchId: user.branchId,
        rolScope: user.rolScope,
    };
};


/**
 * Red de seguridad para las líneas escritas a mano —`logger.info({ user })`—,
 * que no pasan por el saneador del payload.
 *
 * Van en la grafía con la que se escriben en el código y no en minúsculas como
 * las del saneador: `redact` compara exacto, así que `refreshtoken` no taparía
 * un `refreshToken`. Cubre el primer y el segundo nivel sin coste; más abajo
 * ya no llega, y por eso el cuerpo de la petición se sanea aparte.
 */
const MANUAL_FIELDS = [
    'password',
    'newPassword',
    'currentPassword',
    'passwordHash',
    'token',
    'accessToken',
    'refreshToken',
    'apiKey',
    'secret',
    'authorization',
    'cookie',
    'sessionId',
] as const;

const REDACTED_PATHS = MANUAL_FIELDS.flatMap((field) => [field, `*.${field}`]);


/**
 * El preflight del navegador no es una petición de negocio: lo responde CORS
 * antes de llegar a ningún controller. Registrarlo solo duplica cada llamada
 * del front en el log.
 */
const isPreflight = (req: IncomingMessage): boolean => req.method === 'OPTIONS';


/**
 * Salida legible para desarrollo. En producción NO se usa: allí es JSON por
 * línea, que es lo que un agregador (Loki, Datadog, CloudWatch) sabe indexar.
 *
 * `traceId`, `context` y el resto de campos salen DEBAJO del mensaje, no
 * apretados dentro de él: cada línea dice una cosa y los datos se leen en
 * columna. Solo se ocultan `pid` y `hostname`, que no aportan nada cuando el
 * proceso es tu propia terminal.
 *
 * La fecha va completa y no solo la hora: un log de desarrollo se deja abierto
 * durante días, y "10:41" sin día no sirve para cruzarlo con nada.
 */
const PRETTY_TRANSPORT = {
    target: 'pino-pretty',
    options: {
        colorize: true,
        singleLine: false,
        translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
        ignore: 'pid,hostname',
        errorLikeObjectKeys: ['err', 'error'],
    },
};


/**
 * Configuración de `nestjs-pino` para toda la aplicación.
 *
 * Es una función pura de `LoggingConfig` a `Params`: no conoce Nest ni el
 * entorno, solo lo que ya se decidió en `logging.config.ts`. Así todo el
 * comportamiento del log se prueba sin levantar la aplicación.
 *
 * `quietReqLogger` junto con el renombre de `reqId`: cada línea escrita durante
 * una petición —la del propio ciclo HTTP, pero también las de los casos de uso,
 * los handlers de eventos, las consultas a la base y el filtro de excepciones—
 * sale con `traceId` y nada más del request. El detalle de la petición va en
 * sus dos líneas propias, la de entrada y la de cierre.
 */
export const buildLoggerParams = ({ level, pretty, logRequestPayload }: LoggingConfig): Params => {
    /**
     * Lo que acompaña a la línea de cierre.
     *
     * Con la consola legible, `req` y `res` no se escriben —el mensaje ya dice
     * método, ruta y estado— así que la IP se añade suelta. En JSON van los
     * serializadores completos y esto sobra.
     */
    const closingRecord = (req: IncomingMessage, val: object): object => ({
        ...val,
        ...businessContext(req),
        ...(pretty ? { ip: ipOf(req) } : {}),
    });


    const pinoHttp: Options = {
        level,
        genReqId,
        quietReqLogger: true,
        customAttributeKeys: { reqId: TRACE_ID_KEY },
        customLogLevel: requestLevel,
        customSuccessMessage: requestMessage,
        customErrorMessage: requestMessage,
        autoLogging: { ignore: isPreflight },
        redact: { paths: REDACTED_PATHS, censor: REDACTED },

        // Hora ISO en el JSON: `1788533056755` no se lee, y un log lo acaba
        // mirando una persona aunque lo haya escrito una máquina.
        timestamp: stdTimeFunctions.isoTime,

        /**
         * Sin envolver: los serializadores reciben así el objeto crudo de
         * Express y no la versión que `pino-http` ya recortó. Es lo que
         * permite leer `originalUrl` y `ip`, que en la versión recortada no
         * existen.
         */
        wrapSerializers: false,

        /**
         * Serializadores escritos a mano y no los de serie: aquellos vuelcan
         * los headers completos —y ahí viaja el `Authorization`—, además de
         * `query`, `params`, el puerto de origen y el resto de la petición.
         *
         * De los headers solo sobrevive el `user-agent`, que es el único que
         * dice algo al depurar. La IP se queda porque sin ella no se puede
         * seguir a quien esté abusando de un endpoint.
         *
         * En desarrollo NO se escriben: el mensaje ya dice método, ruta y
         * estado, así que `req` y `res` eran ocho líneas para repetirlo. En
         * producción sí, porque ahí son campos que el agregador filtra.
         */
        serializers: pretty
            // Devolviendo `undefined` la clave no se escribe. Quitar el
            // serializador NO es equivalente: sin él, pino vuelca el objeto
            // `ServerResponse` entero, que son doscientas líneas de sockets y
            // temporizadores por petición.
            ? { req: () => undefined, res: () => undefined }
            : {
                req: (req: IncomingMessage) => ({
                    method: req.method,
                    url: urlOf(req),
                    ip: ipOf(req),
                    userAgent: req.headers['user-agent'],
                }),
                res: (res: ServerResponse) => ({ statusCode: res.statusCode }),
            },

        /**
         * El usuario se añade al cerrar, que es cuando existe.
         *
         * En desarrollo se suma la IP suelta —los serializadores están
         * apagados— y NO el cuerpo, que ya salió en la línea de entrada:
         * escribirlo dos veces por petición llena la consola con lo mismo. En
         * producción, al revés.
         */
        customSuccessObject: (req, _res, val: object) => closingRecord(req, val),
        customErrorObject: (req, _res, _error, val: object) => closingRecord(req, val),

        /**
         * La petición se anuncia al entrar, con el cuerpo que trae.
         *
         * Va atado a `logRequestPayload` y no al formato: si el cuerpo no se
         * puede registrar, esta línea no tendría nada que aportar que la de
         * cierre no diga ya. Y como el cuerpo sale AQUÍ, la línea de cierre no
         * lo repite: escribirlo dos veces por petición llena la consola con lo
         * mismo.
         */
        ...(logRequestPayload
            ? {
                customReceivedMessage: receivedMessage,
                customReceivedObject: (req: IncomingMessage) => payloadOf(req, false),
            }
            : {}),

        ...(pretty
            ? { transport: PRETTY_TRANSPORT }
            : {
                // En JSON el nivel sale como texto ("error") y no como número
                // (50): un log que también lee una persona no debería necesitar
                // traducción.
                formatters: { level: (label: string) => ({ level: label }) },
            }),
    };

    return { pinoHttp };
};
