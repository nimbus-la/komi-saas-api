import { Logger } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

import { CorsConfig } from '@/interfaces';
import { buildCorsOptions } from './cors.factory';


const baseConfig: CorsConfig = {
    origins: ['https://app.komi.com'],
    allowLocalhost: false,
};

const configWith = (overrides: Partial<CorsConfig>): CorsConfig => ({
    ...baseConfig,
    ...overrides,
});

/**
 * Ejecuta el callback de `origin` y devuelve el veredicto.
 * El tipo del paquete `cors` declara `requestOrigin: string`, pero en runtime
 * llega `undefined` cuando la petición no viene de un navegador: por eso el
 * helper acepta undefined y hace el cast en el borde.
 */
const isAllowed = (options: CorsOptions, requestOrigin: string | undefined): boolean => {
    const { origin } = options;

    if (typeof origin !== 'function') {
        throw new Error('Se esperaba una función en `origin`');
    };

    let allowed = false;

    origin(requestOrigin as string, (error, result) => {
        if (error) {
            throw error;
        };

        allowed = result === true;
    });

    return allowed;
};


describe('buildCorsOptions', () => {
    beforeAll(() => {
        // Silencia los logs de arranque para no ensuciar la salida de jest
        Logger.overrideLogger(false);
    });

    describe('modo whitelist', () => {
        it('permite un origen de la lista', () => {
            const options = buildCorsOptions(baseConfig);

            expect(isAllowed(options, 'https://app.komi.com')).toBe(true);
        });

        it('bloquea un origen que no está en la lista', () => {
            const options = buildCorsOptions(baseConfig);

            expect(isAllowed(options, 'https://evil.com')).toBe(false);
        });

        it('permite peticiones sin Origin (curl, Postman, health checks)', () => {
            const options = buildCorsOptions(baseConfig);

            expect(isAllowed(options, undefined)).toBe(true);
            expect(isAllowed(options, '')).toBe(true);
        });

        it('bloquea todo si la lista está vacía', () => {
            const options = buildCorsOptions(configWith({ origins: [] }));

            expect(isAllowed(options, 'https://app.komi.com')).toBe(false);
        });

        // La sesión viaja en cookies, y sin credenciales el navegador no las manda.
        it('habilita siempre las credenciales y fija el tiempo del preflight', () => {
            const options = buildCorsOptions(baseConfig);

            expect(options.credentials).toBe(true);
            expect(options.maxAge).toBe(7200);
        });
    });

    describe('localhost', () => {
        const devConfig = configWith({ allowLocalhost: true });

        it.each([
            'http://localhost:3000',
            'https://localhost:5173',
            'http://localhost',
            'http://127.0.0.1:8080',
            'http://127.0.0.1',
        ])('permite %s fuera de producción', (origin) => {
            expect(isAllowed(buildCorsOptions(devConfig), origin)).toBe(true);
        });

        it('lo bloquea cuando allowLocalhost es false (producción)', () => {
            const options = buildCorsOptions(baseConfig);

            expect(isAllowed(options, 'http://localhost:3000')).toBe(false);
        });

        /**
         * El anclaje del regex es lo único que separa "permito localhost" de
         * "permito cualquier dominio que contenga la palabra localhost".
         */
        it.each([
            'http://localhost:3000.evil.com',
            'http://localhost.evil.com',
            'https://evil.com/localhost',
            'http://evil.com#localhost',
            'http://127.0.0.1.evil.com',
            'http://notlocalhost',
        ])('no deja pasar %s ni siquiera en desarrollo', (origin) => {
            expect(isAllowed(buildCorsOptions(devConfig), origin)).toBe(false);
        });
    });

    describe('cabeceras y métodos', () => {
        it('expone el contrato que espera el front', () => {
            const options = buildCorsOptions(baseConfig);

            expect(options.allowedHeaders).toContain('Authorization');
            // El negocio sale del token, así que el front no tiene por qué mandarlo.
            expect(options.allowedHeaders).not.toContain('X-Tenant-Id');
            expect(options.exposedHeaders).toContain('X-Total-Count');
            // Sin exponerlo, el navegador oculta el header y el front no puede
            // leer el identificador de la petición.
            expect(options.exposedHeaders).toContain('X-Request-Id');
            // Sin permitirlo, el preflight falla cuando el front manda el suyo.
            expect(options.allowedHeaders).toContain('X-Request-Id');
            expect(options.methods).toEqual(
                expect.arrayContaining(['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'])
            );
            expect(options.optionsSuccessStatus).toBe(204);
        });
    });
});
