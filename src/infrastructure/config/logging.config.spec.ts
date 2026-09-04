import { LoggingConfig } from '@/interfaces';

import loggingConfig from './logging.config';
import { Enviroment } from './env.validation';


/** La configuración se lee de `process.env`, así que cada caso parte de cero. */
const build = (env: Record<string, string | undefined>): LoggingConfig => {
    const previous = { ...process.env };

    for (const key of ['NODE_ENV', 'LOG_LEVEL', 'LOG_PRETTY', 'LOG_REQUEST_PAYLOAD']) {
        delete process.env[key];
    };

    Object.assign(process.env, env);

    try {
        return loggingConfig();

    } finally {
        process.env = previous;
    };
};



describe('loggingConfig', () => {
    describe('nivel', () => {
        it('sin LOG_LEVEL lo decide el entorno', () => {
            expect(build({ NODE_ENV: Enviroment.Development }).level).toBe('debug');
            expect(build({ NODE_ENV: Enviroment.Production }).level).toBe('info');
            expect(build({ NODE_ENV: Enviroment.Test }).level).toBe('silent');
        });


        it('LOG_LEVEL manda sobre el entorno', () => {
            expect(build({ NODE_ENV: Enviroment.Production, LOG_LEVEL: 'debug' }).level).toBe('debug');
        });


        it('no distingue mayúsculas ni espacios de más', () => {
            expect(build({ NODE_ENV: Enviroment.Development, LOG_LEVEL: '  WARN ' }).level).toBe('warn');
        });


        /** Un nivel inventado no puede dejar la aplicación muda. */
        it('un valor que no existe cae al del entorno', () => {
            expect(build({ NODE_ENV: Enviroment.Development, LOG_LEVEL: 'ruidoso' }).level).toBe('debug');
        });
    });


    describe('consola legible', () => {
        it('activa fuera de producción, salvo que se apague', () => {
            expect(build({ NODE_ENV: Enviroment.Development }).pretty).toBe(true);
            expect(build({ NODE_ENV: Enviroment.Development, LOG_PRETTY: 'false' }).pretty).toBe(false);
        });


        /**
         * `pino-pretty` es dependencia de desarrollo: en producción no está
         * instalado y activarlo tumbaría el arranque.
         */
        it('en producción es que NO, diga lo que diga la variable', () => {
            expect(build({ NODE_ENV: Enviroment.Production, LOG_PRETTY: 'true' }).pretty).toBe(false);
        });
    });


    describe('cuerpo de la petición', () => {
        it('se registra en desarrollo, y puede apagarse', () => {
            expect(build({ NODE_ENV: Enviroment.Development }).logRequestPayload).toBe(true);
            expect(build({ NODE_ENV: Enviroment.Development, LOG_REQUEST_PAYLOAD: 'false' }).logRequestPayload).toBe(false);
        });


        /**
         * La garantía que justifica toda esta configuración: en producción el
         * cuerpo son datos del cliente, no material de depuración, y un log se
         * copia, se reenvía y se archiva.
         */
        it('en producción NUNCA, diga lo que diga la variable', () => {
            expect(build({ NODE_ENV: Enviroment.Production, LOG_REQUEST_PAYLOAD: 'true' }).logRequestPayload).toBe(false);
        });
    });
});
