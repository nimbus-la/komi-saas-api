import { PinoLogger } from "nestjs-pino";


/**
 * Recoge lo que revienta fuera de una petición y de todo `catch`.
 *
 * El filtro de excepciones solo ve lo que sube por el ciclo HTTP. Un
 * `setTimeout` que falla, un handler de evento que rechaza una promesa o un
 * driver que se cae en segundo plano no pasan por ahí, y sin esto Node los
 * escribe por stderr en otro formato o mata el proceso sin dejar rastro.
 *
 * Cuidado con un efecto de registrar estos listeners, y es que Node deja de
 * aplicar su comportamiento por defecto. Por eso aquí se reproduce a mano,
 * registrar y terminar, en vez de tragarse el error y seguir con un proceso en
 * estado desconocido.
 */
export interface ProcessErrorHandlersOptions {
    /** Ya configurado. Se usa fuera de toda petición, así que no lleva `traceId`. */
    logger: PinoLogger;

    /** Cierre ordenado de conexiones, pool de la base y suscripciones. */
    shutdown: () => Promise<void>;

    /** Margen para ese cierre antes de terminar por las bravas. */
    shutdownTimeoutMs?: number;
};


const DEFAULT_SHUTDOWN_TIMEOUT_MS = 5_000;


/** Código de salida habitual para "el proceso murió por un error". */
const FAILURE_EXIT_CODE = 1;


export const registerProcessErrorHandlers = ({
    logger,
    shutdown,
    shutdownTimeoutMs = DEFAULT_SHUTDOWN_TIMEOUT_MS,
}: ProcessErrorHandlersOptions): void => {
    logger.setContext('Process');

    let terminating = false;


    /**
     * Cierra la aplicación y termina.
     *
     * Se cierra ordenadamente en lugar de salir en seco, porque un
     * `process.exit` inmediato corta el pool de Postgres a media transacción y
     * deja conexiones colgando del otro lado.
     *
     * Lleva dos protecciones. Una contra la reentrada, ya que un fallo grave
     * suele venir acompañado de otros y no tiene sentido cerrar dos veces. Y un
     * temporizador, porque el propio cierre puede colgarse justo cuando lo que
     * falla es una conexión.
     */
    const terminate = (): void => {
        if (terminating) {
            return;
        };

        terminating = true;

        const forceExit = setTimeout(() => process.exit(FAILURE_EXIT_CODE), shutdownTimeoutMs);

        void shutdown()
            .catch((error: unknown) => {
                logger.error({ err: error }, 'Falló el cierre ordenado tras un error fatal');
            })
            .finally(() => {
                clearTimeout(forceExit);
                process.exit(FAILURE_EXIT_CODE);
            });
    };


    // Se usa `fatal` porque es el único nivel que vacía el buffer de pino de
    // golpe. Sin eso la línea se perdería al salir.
    process.on('uncaughtException', (error: Error, origin: string) => {
        logger.fatal({ err: error, origin }, 'Excepción no capturada: el proceso va a terminar');
        terminate();
    });


    // Una promesa rechazada sin `catch`. Casi siempre es un `await` que faltó.
    process.on('unhandledRejection', (reason: unknown) => {
        logger.fatal({ err: reason }, 'Promesa rechazada sin manejar: el proceso va a terminar');
        terminate();
    });
};
