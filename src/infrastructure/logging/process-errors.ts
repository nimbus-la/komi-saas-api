import { PinoLogger } from "nestjs-pino";


/**
 * Lo que revienta FUERA de toda petición y de todo `catch`.
 *
 * El filtro de excepciones solo ve lo que sube por el ciclo HTTP. Un
 * `setTimeout` que falla, un handler de evento que rechaza una promesa o un
 * driver que se cae en segundo plano no pasan por ahí: sin esto, Node escribe
 * el error por stderr en otro formato —o mata el proceso sin dejar rastro en el
 * log— y en ninguno de los dos casos queda junto al resto.
 *
 * Ojo con el efecto de registrar estos listeners: Node deja de aplicar su
 * comportamiento por defecto. Por eso aquí se reproduce a mano —registrar y
 * terminar— en vez de tragarse el error y seguir con un proceso en estado
 * desconocido, que es lo peligroso de verdad.
 */
export interface ProcessErrorHandlersOptions {
    /** Ya configurado. Se usa fuera de toda petición, así que no lleva traceId. */
    logger: PinoLogger;

    /** Cierre ordenado: conexiones, pool de la base, suscripciones. */
    shutdown: () => Promise<void>;

    /** Margen para ese cierre antes de terminar por las bravas. */
    shutdownTimeoutMs?: number;
};


const DEFAULT_SHUTDOWN_TIMEOUT_MS = 5_000;


/** Código de salida convencional para "el proceso murió por un error". */
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
     * Se cierra ordenadamente en vez de salir en seco: un `process.exit`
     * inmediato corta el pool de Postgres a media transacción y deja
     * conexiones colgando del lado del servidor.
     *
     * Y se protege de dos formas. Contra la reentrada, porque un fallo grave
     * suele venir acompañado de otros y no tiene sentido intentar el cierre dos
     * veces. Y con un temporizador, porque el cierre ordenado puede colgarse
     * justamente cuando lo que falla es una conexión: pasado el margen, se sale
     * igual.
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


    /**
     * `fatal` a propósito: es el único nivel que vacía el buffer de pino de
     * forma síncrona, y sin eso la línea se perdería al salir.
     */
    process.on('uncaughtException', (error: Error, origin: string) => {
        logger.fatal({ err: error, origin }, 'Excepción no capturada: el proceso va a terminar');
        terminate();
    });


    /** Una promesa rechazada sin `catch`. Casi siempre, un `await` que faltó. */
    process.on('unhandledRejection', (reason: unknown) => {
        logger.fatal({ err: reason }, 'Promesa rechazada sin manejar: el proceso va a terminar');
        terminate();
    });
};
