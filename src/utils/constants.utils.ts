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