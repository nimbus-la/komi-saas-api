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



/** Nombre con el que viaja el refresh token. Cambiarlo desloguea a todo el mundo. */
export const REFRESH_COOKIE_NAME = 'komi_rt';

/**
 * A qué rutas la manda el navegador.
 *
 * '/auth' y no '/auth/refresh': el logout también tiene que recibirla para
 * poder borrarla, y una cookie acotada a /auth/refresh sencillamente no llega
 * a /auth/logout. Con '/auth' quedan cubiertos los tres endpoints y el token
 * sigue sin viajar en cada petición al resto de la API, que es de lo que se
 * trata acotar el path.
 */
export const REFRESH_COOKIE_PATH = '/auth';
