export interface CorsConfig {
    /** Orígenes permitidos. Lista vacía => se bloquea todo origen de navegador. */
    origins: string[];
    /**
     * Permite localhost/127.0.0.1 en CUALQUIER puerto.
     * Solo se activa fuera de producción.
     */
    allowLocalhost: boolean;
};
