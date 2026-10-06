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
 * Cuántos segundos guarda el navegador la respuesta del preflight antes de volver
 * a preguntar. Chrome no respeta más de dos horas, así que un número mayor no
 * ahorraría ninguna petición.
 */
const PREFLIGHT_MAX_AGE_SECONDS = 7200;


/**
 * Indica si un origen de navegador puede hablar con la API. La usan CORS y el
 * guard de origen, para que los dos acepten exactamente los mismos orígenes.
 */
export const isOriginAllowed = (cors: CorsConfig, origin: string): boolean => {
    return cors.origins.includes(origin)
        || (cors.allowLocalhost && LOCALHOST_PATTERN.test(origin));
}


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
    if (cors.origins.length === 0) {
        logger.warn('CORS_ORIGINS vacío - se bloqueará cualquier origen de navegador');
    } else {
        logger.log(`CORS habilitado para: ${cors.origins.join(', ')}`);
    };

    if (cors.allowLocalhost) {
        logger.log('CORS: localhost permitido en cualquier puerto (entorno no productivo)');
    };

    return {
        methods: METHODS,
        allowedHeaders: ALLOWED_HEADERS,
        exposedHeaders: EXPOSED_HEADERS,
        maxAge: PREFLIGHT_MAX_AGE_SECONDS,
        // 204 ya es el default del paquete cors; explícito para que la
        // respuesta al preflight no dependa de que ese default no cambie.
        optionsSuccessStatus: 204,
        // La sesión viaja en cookies, así que el navegador siempre tiene que
        // poder mandarlas.
        credentials: true,
        origin: (
            requestOrigin: string,
            callback: (err: Error | null, allow?: boolean) => void
        ): void => {
            if (!requestOrigin) {
                callback(null, true);
                return;
            };

            if (isOriginAllowed(cors, requestOrigin)) {
                callback(null, true);
                return;
            };

            /**
             * debug y no warn: el origen lo controla quien llama, sin
             * autenticarse, así que a nivel warn cualquiera puede inflar el log.
             */
            logger.debug(`Origen bloqueado por CORS: ${requestOrigin}`);
            callback(null, false);
        },
    };
};
