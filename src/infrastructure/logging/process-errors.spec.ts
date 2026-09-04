import { PinoLogger } from 'nestjs-pino';

import { registerProcessErrorHandlers } from './process-errors';


type Handler = (...args: unknown[]) => void;


/**
 * Captura los listeners en vez de emitir los eventos de verdad: un
 * `uncaughtException` real dentro de Jest se lleva por delante la ejecución.
 */
const setup = (shutdown: () => Promise<void>, shutdownTimeoutMs?: number) => {
    const handlers: Record<string, Handler> = {};
    const logger = { setContext: jest.fn(), fatal: jest.fn(), error: jest.fn() };

    jest.spyOn(process, 'on').mockImplementation((event: string | symbol, handler: Handler) => {
        handlers[String(event)] = handler;
        return process;
    });

    const exit = jest.spyOn(process, 'exit').mockImplementation((() => undefined) as never);

    registerProcessErrorHandlers({
        logger: logger as unknown as PinoLogger,
        shutdown,
        ...(shutdownTimeoutMs === undefined ? {} : { shutdownTimeoutMs }),
    });

    return { handlers, logger, exit };
};


/** Deja correr las microtareas pendientes del cierre. */
const settle = (): Promise<void> => new Promise((resolve) => { setImmediate(resolve); });



describe('registerProcessErrorHandlers', () => {
    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
    });


    it('escucha las excepciones y las promesas sin manejar', () => {
        const { handlers } = setup(async () => undefined);

        expect(Object.keys(handlers).sort()).toEqual(['uncaughtException', 'unhandledRejection']);
    });


    describe('ante una excepción no capturada', () => {
        it('la registra como fatal, con su origen', async () => {
            const { handlers, logger } = setup(async () => undefined);
            const error = new Error('boom');

            handlers['uncaughtException']!(error, 'uncaughtException');
            await settle();

            expect(logger.fatal).toHaveBeenCalledWith(
                { err: error, origin: 'uncaughtException' },
                expect.stringContaining('va a terminar'),
            );
        });


        /**
         * Un `process.exit` en seco corta el pool de Postgres a media
         * transaccion y deja conexiones colgando del lado del servidor.
         */
        it('cierra la aplicación antes de salir', async () => {
            const orden: string[] = [];
            const shutdown = jest.fn(async () => { orden.push('shutdown'); });

            const { handlers, exit } = setup(shutdown);
            exit.mockImplementation((() => { orden.push('exit'); }) as never);

            handlers['uncaughtException']!(new Error('boom'), 'uncaughtException');
            await settle();

            expect(orden).toEqual(['shutdown', 'exit']);
            expect(exit).toHaveBeenCalledWith(1);
        });


        /** Un fallo grave viene acompañado de otros: el cierre se intenta UNA vez. */
        it('no intenta el cierre dos veces', async () => {
            const shutdown = jest.fn(async () => undefined);
            const { handlers } = setup(shutdown);

            handlers['uncaughtException']!(new Error('uno'), 'uncaughtException');
            handlers['uncaughtException']!(new Error('dos'), 'uncaughtException');
            handlers['unhandledRejection']!(new Error('tres'));
            await settle();

            expect(shutdown).toHaveBeenCalledTimes(1);
        });


        /**
         * El cierre puede colgarse justo cuando lo que falla es una conexion:
         * pasado el margen, se sale igual.
         */
        it('sale igual si el cierre se cuelga', () => {
            jest.useFakeTimers();

            const { handlers, exit } = setup(() => new Promise<void>(() => undefined), 5_000);

            handlers['uncaughtException']!(new Error('boom'), 'uncaughtException');

            expect(exit).not.toHaveBeenCalled();

            jest.advanceTimersByTime(5_000);

            expect(exit).toHaveBeenCalledWith(1);
        });


        it('sale aunque el propio cierre falle', async () => {
            const { handlers, logger, exit } = setup(async () => { throw new Error('el cierre fallo'); });

            handlers['uncaughtException']!(new Error('boom'), 'uncaughtException');
            await settle();

            expect(logger.error).toHaveBeenCalledWith(
                { err: expect.any(Error) },
                expect.stringContaining('cierre ordenado'),
            );
            expect(exit).toHaveBeenCalledWith(1);
        });
    });


    it('una promesa rechazada también termina el proceso', async () => {
        const { handlers, logger, exit } = setup(async () => undefined);

        handlers['unhandledRejection']!('se rechazo sin catch');
        await settle();

        expect(logger.fatal).toHaveBeenCalledWith(
            { err: 'se rechazo sin catch' },
            expect.stringContaining('Promesa rechazada'),
        );
        expect(exit).toHaveBeenCalledWith(1);
    });
});
