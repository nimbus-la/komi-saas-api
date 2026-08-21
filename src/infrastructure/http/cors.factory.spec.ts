import { Logger } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

import { CorsConfig } from '@/interfaces';
import { buildCorsOptions } from './cors.factory';


const baseConfig: CorsConfig = {
    origins: ['https://app.komi.com'],
    allowAnyOrigin: false,
    credentials: true,
    maxAge: 86400,
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

        it('propaga credentials y maxAge', () => {
            const options = buildCorsOptions(configWith({ credentials: false, maxAge: 600 }));

            expect(options.credentials).toBe(false);
            expect(options.maxAge).toBe(600);
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

    describe("modo '*'", () => {
        const openConfig = configWith({ allowAnyOrigin: true, origins: [] });

        it('refleja cualquier origen', () => {
            expect(buildCorsOptions(openConfig).origin).toBe(true);
        });

        it('fuerza credentials a false aunque la config diga true', () => {
            expect(openConfig.credentials).toBe(true);
            expect(buildCorsOptions(openConfig).credentials).toBe(false);
        });
    });

    describe('cabeceras y métodos', () => {
        it.each([
            ['whitelist', baseConfig],
            ["'*'", configWith({ allowAnyOrigin: true })],
        ])('%s expone el mismo contrato', (_caso, config) => {
            const options = buildCorsOptions(config);

            expect(options.allowedHeaders).toContain('Authorization');
            expect(options.allowedHeaders).toContain('X-Tenant-Id');
            expect(options.exposedHeaders).toContain('X-Total-Count');
            expect(options.methods).toEqual(
                expect.arrayContaining(['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'])
            );
            expect(options.optionsSuccessStatus).toBe(204);
        });
    });
});
