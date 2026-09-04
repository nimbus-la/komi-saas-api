import { PinoLogger } from 'nestjs-pino';

import { DatabaseLogger } from './database.logger';


/** Doble de `PinoLogger` con los cuatro niveles que usa el adaptador. */
const createLogger = () => ({
    setContext: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
});


const build = (logQueries: boolean) => {
    const pino = createLogger();

    return { pino, logger: new DatabaseLogger(pino as unknown as PinoLogger, logQueries) };
};


const SELECT = 'SELECT * FROM tenants WHERE tenant_slug = $1';



describe('DatabaseLogger', () => {
    it('se identifica como TypeORM en el log', () => {
        const { pino } = build(true);

        expect(pino.setContext).toHaveBeenCalledWith('TypeORM');
    });


    describe('consultas', () => {
        /**
         * En `debug` a propósito: son cientos por minuto y en producción no se
         * miran. Con LOG_LEVEL=info desaparecen sin tocar la conexión.
         */
        it('van en debug, con la consulta como mensaje y los parámetros aparte', () => {
            const { pino, logger } = build(true);

            logger.logQuery(SELECT, ['mi-negocio']);

            expect(pino.debug).toHaveBeenCalledWith({ parameters: ['mi-negocio'] }, SELECT);
        });


        it('sin parámetros no se inventa la clave', () => {
            const { pino, logger } = build(true);

            logger.logQuery(SELECT, []);
            logger.logQuery(SELECT);

            expect(pino.debug).toHaveBeenNthCalledWith(1, {}, SELECT);
            expect(pino.debug).toHaveBeenNthCalledWith(2, {}, SELECT);
        });


        /**
         * TypeORM llama a estos métodos siempre y deja la decisión al logger:
         * si no se consultara `DB_LOGGING` aquí, esa variable dejaría de
         * significar nada.
         */
        it('con DB_LOGGING apagado no se registran', () => {
            const { pino, logger } = build(false);

            logger.logQuery(SELECT, ['mi-negocio']);

            expect(pino.debug).not.toHaveBeenCalled();
        });
    });


    describe('consultas que fallan', () => {
        it('registran el motivo, la consulta y los parámetros', () => {
            const { pino, logger } = build(true);

            logger.logQueryError(new Error('duplicate key value'), SELECT, ['mi-negocio']);

            expect(pino.error).toHaveBeenCalledWith(
                { parameters: ['mi-negocio'], query: SELECT },
                'duplicate key value',
            );
        });


        it('aceptan también un motivo que llega como texto', () => {
            const { pino, logger } = build(true);

            logger.logQueryError('conexión perdida', SELECT);

            expect(pino.error).toHaveBeenCalledWith({ query: SELECT }, 'conexión perdida');
        });


        /**
         * Lo que hace visible un fallo que hoy se pierde: si la consulta
         * revienta dentro de un handler de eventos o de un `catch` que se la
         * traga, esta es la única constancia de que ocurrió.
         */
        it('se registran aunque DB_LOGGING esté apagado', () => {
            const { pino, logger } = build(false);

            logger.logQueryError(new Error('boom'), SELECT);

            expect(pino.error).toHaveBeenCalled();
        });
    });


    describe('consultas lentas', () => {
        it('van en warn, con la duración', () => {
            const { pino, logger } = build(true);

            logger.logQuerySlow(1500, SELECT, ['mi-negocio']);

            expect(pino.warn).toHaveBeenCalledWith(
                { parameters: ['mi-negocio'], durationMs: 1500 },
                SELECT,
            );
        });
    });


    describe('avisos generales', () => {
        it('un warn de TypeORM sigue siendo un warn', () => {
            const { pino, logger } = build(true);

            logger.log('warn', 'la conexión se va a reintentar');

            expect(pino.warn).toHaveBeenCalledWith('la conexión se va a reintentar');
            expect(pino.info).not.toHaveBeenCalled();
        });


        it('el resto va en info', () => {
            const { pino, logger } = build(true);

            logger.log('log', 'algo');
            logger.log('info', 'otra cosa');
            logger.logSchemaBuild('creando tabla');
            logger.logMigration('migración aplicada');

            expect(pino.info).toHaveBeenCalledTimes(4);
        });
    });
});
