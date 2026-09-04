import { IncomingMessage, ServerResponse } from "node:http";

import { Params } from "nestjs-pino";
import { stdTimeFunctions } from "pino";
import { Options } from "pino-http";

import type { AuthenticatedUser } from "@/auth/infrastructure/types";
import { LoggingConfig } from "@/interfaces";

import { REDACTED, sanitize } from "./sanitizer.util";
import { resolveTraceId, TRACE_ID_HEADER } from "./trace-id.util";



/**
 * El identificador de la petición se llama igual en el log, en el header
 * `X-Request-Id` y en el cuerpo de la respuesta, así que buscarlo es un solo
 * grep.
 */
const TRACE_ID_KEY = 'traceId';


/**
 * La petición con lo que le van colgando por el camino, o sea lo que parsea
 * Express y el usuario que resuelve el guard de autenticación.
 *
 * `AuthenticatedUser` se importa en vez de copiar su forma aquí. Si mañana ese
 * token cambia, esto tiene que dejar de compilar en lugar de seguir escribiendo
 * un `tenantId` que ya no existe.
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
 * Crea el identificador de la petición y lo devuelve por el header antes de
 * que corra ningún guard ni controlador, así el cliente lo tiene aunque la
 * cosa termine mal.
 *
 * Pino lo guarda en `req.id` y de ahí lo leen el filtro de errores y el
 * interceptor de respuesta.
 */
const genReqId = (req: IncomingMessage, res: ServerResponse): string => {
    const traceId = resolveTraceId(req.headers['x-request-id']);

    res.setHeader(TRACE_ID_HEADER, traceId);

    return traceId;
};


/** La ruta completa, aunque un router la haya reescrito por el camino. */
const urlOf = (req: IncomingMessage): string =>
    (req as LoggedRequest).originalUrl ?? req.url ?? '?';


/**
 * Cómo termina una petición, por ejemplo `POST /auth/login -> 401`.
 *
 * Va en ASCII porque una flecha `→` ocupa varios bytes y las consolas de
 * Windows que no están en UTF-8 la pintan como `ÔåÆ`. La duración no se pone
 * aquí, sale en el campo `responseTime`.
 */
const requestMessage = (req: IncomingMessage, res: ServerResponse): string =>
    `${req.method ?? '?'} ${urlOf(req)} -> ${res.statusCode}`;


/**
 * Anuncia la petición que entra, por ejemplo `--> POST /auth/login`.
 *
 * Si el proceso se cae o se cuelga a mitad, la línea de cierre nunca llega a
 * escribirse y esta es la única pista de qué la provocó.
 *
 * Se probó abrir con una regla de guiones para separar peticiones y quedaba
 * peor, porque pino-pretty escribe el mensaje detrás del nivel y la regla se
 * llevaba la línea del timestamp.
 */
const receivedMessage = (req: IncomingMessage): string =>
    `--> ${req.method ?? '?'} ${urlOf(req)}`;


/**
 * Pone la línea de cierre en el nivel que le toca según cómo acabó.
 *
 * Pino-http lo escribe todo en `info` por defecto, así que un 500 quedaba al
 * mismo nivel que una petición que fue bien y con `LOG_LEVEL=warn` no se veía
 * ninguno de los dos.
 */
const requestLevel = (_req: IncomingMessage, res: ServerResponse, error?: Error): 'error' | 'warn' | 'info' => {
    if (error !== undefined || res.statusCode >= 500) {
        return 'error';
    };

    return res.statusCode >= 400 ? 'warn' : 'info';
};


/**
 * Con qué llegó la petición, o sea el cuerpo, la query string y los parámetros
 * de la ruta.
 *
 * Hacen falta los tres para reproducir un fallo, porque un
 * `PATCH /branch/:id?force=true` no se rehace solo con el cuerpo. Si no hay
 * nada que registrar devuelve un objeto vacío y así no aparece un `payload: {}`
 * en cada lectura.
 */
const payloadOf = (req: IncomingMessage, includeParams: boolean): object => {
    const { body, query, params } = req as LoggedRequest;

    const payload = {
        // Los parámetros de la ruta no existen hasta que Express la empareja.
        // Al entrar la petición lo que hay ahí son restos internos del router.
        ...(includeParams && isPresent(params) ? { params: sanitize(params) } : {}),
        ...(isPresent(query) ? { query: sanitize(query) } : {}),
        ...(isPresent(body) ? { body: sanitize(body) } : {}),
    };

    return Object.keys(payload).length > 0 ? { payload } : {};
};


/** Descarta lo que no aporta, o sea nulo, indefinido u objeto sin claves. */
const isPresent = (value: unknown): boolean => {
    if (value === null || value === undefined) {
        return false;
    };

    if (typeof value === 'object' && !Array.isArray(value)) {
        return Object.keys(value).length > 0;
    };

    return true;
};


/** La IP del cliente, la ponga Express o haya que sacarla del socket. */
const ipOf = (req: IncomingMessage): string | undefined =>
    (req as LoggedRequest).ip ?? req.socket?.remoteAddress;


/**
 * Quién hizo la petición, sacado del token que el guard ya validó.
 *
 * Con esto, "algo raro pasó con el inventario del negocio 42" se resuelve
 * filtrando por `tenantId` en vez de leyendo el log entero. Solo se sabe al
 * cerrar, porque cuando la petición entra el guard todavía no ha corrido.
 *
 * El `sessionId` no se registra. Identifica una sesión viva y no ayuda a
 * diagnosticar nada.
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
 * Tapa estos campos en las líneas que se escriben a mano, como un
 * `logger.info({ user })`, que no pasan por el saneador del cuerpo.
 *
 * Van escritos como se escriben en el código porque `redact` compara exacto y
 * `refreshtoken` no taparía un `refreshToken`. Solo alcanza el primer y el
 * segundo nivel, y por eso el cuerpo de la petición se sanea aparte.
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
 * El preflight del navegador lo responde CORS antes de llegar a ningún
 * controlador, así que registrarlo solo duplica cada llamada del front.
 */
const isPreflight = (req: IncomingMessage): boolean => req.method === 'OPTIONS';


/**
 * Salida coloreada para trabajar. En producción no se usa, porque allí el log
 * es JSON por línea y lo consume un agregador como Loki o Datadog.
 *
 * El `traceId`, el contexto y los demás campos salen debajo del mensaje y no
 * apretados dentro de él, para poder leerlos en columna. Se ocultan `pid` y
 * `hostname`, que no dicen nada cuando el proceso es tu propia terminal.
 *
 * La fecha va completa. Un log de desarrollo se deja abierto durante días y un
 * "10:41" a secas no sirve para cruzarlo con nada.
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
 * Arma la configuración de pino para toda la aplicación.
 *
 * Solo depende de `LoggingConfig`, no de Nest ni del entorno, así que el
 * comportamiento del log se puede probar sin levantar la aplicación. Quién
 * decide esos valores es `logging.config.ts`.
 *
 * `quietReqLogger` hace que cada línea escrita durante una petición lleve el
 * `traceId` y nada más del request. Eso vale para las del ciclo HTTP y también
 * para las de los casos de uso, los eventos y las consultas a la base. El
 * detalle de la petición va en sus dos líneas propias, la de entrada y la de
 * cierre.
 */
export const buildLoggerParams = ({ level, pretty, logRequestPayload }: LoggingConfig): Params => {
    /**
     * Lo que acompaña a la línea de cierre. Con la consola legible se añade la
     * IP suelta, porque ahí `req` y `res` no se escriben. En JSON ya vienen en
     * los serializadores.
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

        // La hora en el JSON va en ISO porque un `1788533056755` no hay quien
        // lo lea, y estos logs los acaba mirando una persona.
        timestamp: stdTimeFunctions.isoTime,

        // Sin envolver, los serializadores reciben el objeto crudo de Express
        // en vez de la versión que pino-http ya recortó. Es lo que permite leer
        // `originalUrl` y `ip`, que en la recortada no están.
        wrapSerializers: false,

        /**
         * Los serializadores están escritos a mano porque los de serie vuelcan
         * los headers completos, y por ahí viaja el `Authorization`. De los
         * headers solo se guarda el `user-agent`, que es el único que ayuda a
         * depurar, y la IP, sin la cual no se puede seguir a quien esté
         * abusando de un endpoint.
         *
         * Con la consola legible no se escriben, porque el mensaje ya dice
         * método, ruta y estado y eran ocho líneas para repetirlo.
         */
        serializers: pretty
            // Devolver `undefined` deja la clave fuera. Quitar el serializador
            // no es lo mismo, porque entonces pino vuelca el `ServerResponse`
            // entero, que son doscientas líneas de sockets por petición.
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

        // El usuario se añade al cerrar, que es cuando ya existe.
        customSuccessObject: (req, _res, val: object) => closingRecord(req, val),
        customErrorObject: (req, _res, _error, val: object) => closingRecord(req, val),

        /**
         * La petición se anuncia al entrar, con el cuerpo que trae. Depende de
         * si se puede registrar el cuerpo y no del formato, porque sin cuerpo
         * esta línea no aporta nada que la de cierre no diga ya.
         *
         * El cuerpo sale aquí y la línea de cierre no lo repite, que si no se
         * escribe dos veces por petición.
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
                // En JSON el nivel sale como texto y no como el número 50, para
                // no tener que traducirlo al leerlo.
                formatters: { level: (label: string) => ({ level: label }) },
            }),
    };

    return { pinoHttp };
};
