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
 * Límites de peticiones por IP. Van en milisegundos porque es lo que espera
 * @nestjs/throttler.
 *
 * Son constantes y no variables de entorno a propósito: el decorador @Throttle
 * se evalúa al definir la clase, cuando todavía no hay ConfigService del que
 * leer. Si algún día hacen falta distintos por entorno, hay que cambiar el
 * decorador por un guard que resuelva el límite en tiempo de ejecución.
 */

/** Tope general: holgado, solo para que nadie martillee la API. */
export const THROTTLE_TTL_MS = 60 * 1000;
export const THROTTLE_LIMIT = 120;

/**
 * Tope del login, mucho más estricto. Frena la fuerza bruta, y de paso el agotar
 * la memoria del proceso: cada intento cuesta un argon2 de 64 MB, así que unos
 * cientos en paralelo tumban el servidor sin necesidad de adivinar contraseña.
 */
export const LOGIN_THROTTLE_TTL_MS = 5 * 60 * 1000;
export const LOGIN_THROTTLE_LIMIT = 5;
