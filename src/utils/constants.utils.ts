// Los valores DEBEN coincidir con las claves de RESPONSE_CATALOG (única fuente de verdad).
export const RESPONSE_CODE = {
    SUCCESS: '0000',
    NO_CONTENT: '0001',
    VALIDATION_ERROR: '1000',
    NOT_FOUND: '2000',
    CONFLICT: '2001',
    INTERNAL_ERROR: '9999',
} as const;



export const DEFAULT_SESSION_TTL_DAYS = 7;
// En segundos, igual que JWT_ACCESS_TTL: 15 minutos.
export const DEFAULT_ACCESS_TTL_SECONDS = 900;

// Factor para convertir la vigencia de la sesión (en días) a milisegundos.
export const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;



/**
 * Quién firma los access token y para quién son. Van dentro del propio token
 * (claims `iss` y `aud`) y se exigen al verificarlo.
 *
 * Sirven para que un token emitido por otro sistema no valga aquí aunque
 * compartiera el secreto por accidente: sin el emisor y la audiencia correctos,
 * la verificación lo rechaza.
 */
export const JWT_ISSUER = 'komi-saas-api';
export const JWT_AUDIENCE = 'komi-saas-client';

/**
 * El único algoritmo aceptado. Se declara explícito al verificar para no
 * depender de la lista que traiga por defecto la librería de turno.
 */
export const JWT_ALGORITHM = 'HS256';



/**
 * Nombres de las dos cookies de la sesión. Cambiarlos desloguea a todo el mundo,
 * porque el navegador conserva las cookies viejas pero nadie las lee.
 *
 * El refresh dejó de llamarse vorea_session cuando su path pasó de /auth a la
 * raíz. Si hubiera conservado el nombre, el navegador mandaría la vieja y la
 * nueva juntas a /auth/refresh, y la vieja llegaría primero.
 *
 * Van sin el prefijo __Host- porque exige el flag Secure, que en desarrollo va
 * apagado al servirse por http plano, y el navegador rechazaría la cookie. Vale
 * agregarlo el día que todos los entornos vayan por HTTPS: impide que un
 * subdominio vecino sobrescriba la sesión.
 */
export const ACCESS_COOKIE_NAME = 'jwt_access';
export const REFRESH_COOKIE_NAME = 'jwt_refresh';

/**
 * Las dos cookies viajan a toda la API. La de acceso lo necesita porque el guard
 * la lee en cada petición, y la de refresh así no depende del prefijo con el que
 * un proxy exponga la API. Con el path acotado a /auth, un proxy que publique la
 * API bajo /api dejaba de mandarla sin ningún error.
 */
export const SESSION_COOKIE_PATH = '/';
