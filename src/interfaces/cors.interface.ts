export interface CorsConfig {
    /** Orígenes permitidos. Lista vacía => se bloquea todo origen de navegador. */
    origins: string[];
    /** Permite '*' explícitamente (solo APIs públicas sin cookies). */
    allowAnyOrigin: boolean;
    /** Habilita el envío de cookies / Authorization con credenciales. */
    credentials: boolean;
    /** Segundos que el navegador cachea el preflight. */
    maxAge: number;
    /**
     * Permite localhost/127.0.0.1 en CUALQUIER puerto.
     * Solo se activa fuera de producción.
     */
    allowLocalhost: boolean;
};
