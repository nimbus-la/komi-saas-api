import { Logger } from "@nestjs/common";
import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";

import { CorsConfig } from "@/interfaces";


const logger = new Logger('Cors');

/**
 * Cabeceras que el navegador puede ENVIAR. Si el front manda un header
 * custom que no esté aquí, el preflight falla aunque el origen sea válido.
 */
const ALLOWED_HEADERS = [
    'Content-Type',
    'Authorization',
    'Accept',
    'X-Requested-With',
    'X-Tenant-Id',
    // Permite que el front mande su propio identificador de petición.
    'X-Request-Id',
];

/**
 * Cabeceras que el navegador puede LEER de la respuesta.
 * Sin esto, el front no ve headers de paginación aunque viajen.
 */
const EXPOSED_HEADERS = [
    'X-Total-Count',
    'X-Page',
    'X-Limit',
    // Sin esta línea el navegador oculta el header y `res.headers.get(...)`
    // devuelve null, sin ningún error. En Postman y en curl sí se ve, que es
    // lo que hace tan difícil de diagnosticar el olvido.
    'X-Request-Id',
];

const METHODS = ['GET', 'HEAD', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'];

/**
 * localhost / 127.0.0.1 en cualquier puerto, http o https.
 * Anclado en ambos extremos: 'http://localhost:3000.evil.com' NO hace match.
 */
const LOCALHOST_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

/**
 * Lo que comparten los dos modos. Entre el modo abierto ('*') y el modo
 * whitelist solo cambian `origin` y `credentials`; el resto vive aquí para
 * que no puedan divergir.
 */
const baseOptions = (cors: CorsConfig): CorsOptions => ({
    methods: METHODS,
    allowedHeaders: ALLOWED_HEADERS,
    exposedHeaders: EXPOSED_HEADERS,
    maxAge: cors.maxAge,
    // 204 ya es el default del paquete `cors`; explícito para que la
    // respuesta al preflight no dependa de que ese default no cambie.
    optionsSuccessStatus: 204,
});


/**
 * Construye las opciones de CORS desde la config tipada.
 *
 * Recibe el `CorsConfig` ya resuelto (no el ConfigService) para que sea una
 * función pura: se puede testear sin levantar un módulo de Nest.
 *
 * Reglas:
 * - Sin `origin` (Postman, curl, SSR de Next, health checks) => se permite:
 *   no es una petición de navegador, CORS no aplica.
 * - Origen en la whitelist => se permite.
 * - localhost en cualquier puerto => se permite SOLO fuera de producción.
 * - Cualquier otro => se rechaza y se loguea.
 */
export const buildCorsOptions = (cors: CorsConfig): CorsOptions => {
    if (cors.allowAnyOrigin) {
        // En producción esto ni siquiera llega: cors.config lo bloquea al arrancar.
        logger.warn("CORS_ORIGINS contiene '*' - cualquier origen puede consumir la API");

        return {
            ...baseOptions(cors),
            origin: true,
            // '*' y credentials son incompatibles por spec
            credentials: false,
        };
    };

    if (cors.origins.length === 0) {
        logger.warn('CORS_ORIGINS vacío - se bloqueará cualquier origen de navegador');
    } else {
        logger.log(`CORS habilitado para: ${cors.origins.join(', ')}`);
    };

    if (cors.allowLocalhost) {
        logger.log('CORS: localhost permitido en cualquier puerto (entorno no productivo)');
    };

    return {
        ...baseOptions(cors),
        origin: (
            requestOrigin: string,
            callback: (err: Error | null, allow?: boolean) => void
        ): void => {
            if (!requestOrigin) {
                callback(null, true);
                return;
            };

            if (cors.origins.includes(requestOrigin)) {
                callback(null, true);
                return;
            };

            if (cors.allowLocalhost && LOCALHOST_PATTERN.test(requestOrigin)) {
                callback(null, true);
                return;
            };

            /**
             * `debug` y no `warn`: el origen lo controla quien llama, sin
             * autenticarse, así que a nivel warn cualquiera puede inflar el log.
             */
            logger.debug(`Origen bloqueado por CORS: ${requestOrigin}`);
            callback(null, false);
        },
        credentials: cors.credentials,
    };
};
