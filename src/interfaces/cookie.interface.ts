/**
 * Lo único de las cookies de sesión que cambia según el entorno. El resto de sus
 * atributos es fijo y vive en SessionCookies.
 */
export interface CookieConfig {
    secure: boolean;
}
