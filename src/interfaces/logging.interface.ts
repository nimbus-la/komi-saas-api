/**
 * Niveles de pino, de más grave a más ruidoso. `silent` apaga la salida.
 *
 * Se declaran aquí —y no se importan de pino— para que la configuración y la
 * validación del entorno no dependan de la librería de logging.
 */
export const LOG_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'] as const;

export type LogLevel = typeof LOG_LEVELS[number];


/**
 * Configuración tipada del logger, bajo el namespace 'logging'. Es lo único
 * que la fábrica de pino necesita saber del entorno.
 */
export interface LoggingConfig {
    /** Nivel mínimo que se escribe. Por debajo de él, la línea ni se genera. */
    level: LogLevel;

    /**
     * Salida coloreada y legible (pino-pretty) en vez de JSON por línea.
     * Solo para desarrollo: en producción el log lo consume una máquina.
     */
    pretty: boolean;

    /**
     * Registrar el cuerpo, la query y los parámetros de ruta de cada petición.
     *
     * NUNCA se activa en producción, aunque la variable de entorno lo pida:
     * allí ese contenido son datos del cliente, no material de depuración, y
     * un log se copia, se reenvía y se archiva.
     */
    logRequestPayload: boolean;
};
