/**
 * Niveles de pino, de más grave a más ruidoso. `silent` apaga la salida.
 *
 * Se declaran aquí en vez de importarlos de pino para que la configuración y la
 * validación del entorno no dependan de esa librería.
 */
export const LOG_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'] as const;

export type LogLevel = typeof LOG_LEVELS[number];


/**
 * Configuración del logger bajo el namespace 'logging'. Es todo lo que la
 * fábrica de pino necesita saber del entorno.
 */
export interface LoggingConfig {
    /** Nivel mínimo que se escribe. Por debajo de él, la línea ni se genera. */
    level: LogLevel;

    /**
     * Salida coloreada y legible con pino-pretty en vez de JSON por línea. Solo
     * para trabajar, porque en producción el log lo consume una máquina.
     */
    pretty: boolean;

    /**
     * Registrar el cuerpo, la query y los parámetros de ruta de cada petición.
     *
     * En producción no se activa aunque la variable lo pida. Allí ese contenido
     * son datos del cliente y no material de depuración, y un log se copia, se
     * reenvía y se archiva.
     */
    logRequestPayload: boolean;
};
