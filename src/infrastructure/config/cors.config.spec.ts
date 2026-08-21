import corsConfig from './cors.config';


/**
 * `registerAs` devuelve la propia factory, así que se puede invocar
 * directamente sin levantar un módulo de Nest.
 */
describe('corsConfig', () => {
    const ORIGINAL_ENV = process.env;

    beforeEach(() => {
        process.env = { ...ORIGINAL_ENV };
        delete process.env['CORS_ORIGINS'];
        delete process.env['CORS_CREDENTIALS'];
        delete process.env['CORS_MAX_AGE'];
        process.env['NODE_ENV'] = 'development';
    });

    afterAll(() => {
        process.env = ORIGINAL_ENV;
    });

    describe('parseo de CORS_ORIGINS', () => {
        it('separa por comas y recorta espacios', () => {
            process.env['CORS_ORIGINS'] = 'https://a.com , https://b.com';

            expect(corsConfig().origins).toEqual(['https://a.com', 'https://b.com']);
        });

        it('normaliza mayúsculas y barra final', () => {
            process.env['CORS_ORIGINS'] = 'https://App.Komi.com/,HTTPS://WWW.KOMI.COM///';

            expect(corsConfig().origins).toEqual([
                'https://app.komi.com',
                'https://www.komi.com',
            ]);
        });

        it('descarta entradas vacías', () => {
            process.env['CORS_ORIGINS'] = 'https://a.com,,  ,';

            expect(corsConfig().origins).toEqual(['https://a.com']);
        });

        it('sin la variable deja la lista vacía y no rompe', () => {
            expect(corsConfig().origins).toEqual([]);
            expect(corsConfig().allowAnyOrigin).toBe(false);
        });
    });

    describe("bandera '*'", () => {
        it("saca '*' de la lista de orígenes y levanta allowAnyOrigin", () => {
            process.env['CORS_ORIGINS'] = '*,https://a.com';

            const config = corsConfig();

            expect(config.allowAnyOrigin).toBe(true);
            expect(config.origins).toEqual(['https://a.com']);
        });

        it('lanza al arrancar si se usa en producción', () => {
            process.env['NODE_ENV'] = 'production';
            process.env['CORS_ORIGINS'] = '*';

            expect(() => corsConfig()).toThrow(/production/);
        });

        it('lo permite fuera de producción', () => {
            process.env['CORS_ORIGINS'] = '*';

            expect(() => corsConfig()).not.toThrow();
        });
    });

    describe('allowLocalhost', () => {
        it('es true en desarrollo y en test', () => {
            expect(corsConfig().allowLocalhost).toBe(true);

            process.env['NODE_ENV'] = 'test';
            expect(corsConfig().allowLocalhost).toBe(true);
        });

        it('es false en producción sin importar el resto de variables', () => {
            process.env['NODE_ENV'] = 'production';
            process.env['CORS_ORIGINS'] = 'https://app.komi.com';

            expect(corsConfig().allowLocalhost).toBe(false);
        });
    });

    describe('credentials', () => {
        it('por defecto está habilitado', () => {
            expect(corsConfig().credentials).toBe(true);
        });

        it("solo se habilita con el literal 'true'", () => {
            process.env['CORS_CREDENTIALS'] = 'true';

            expect(corsConfig().credentials).toBe(true);
        });

        it.each(['false', 'False', '0', 'no', ''])(
            "falla en cerrado ante '%s'",
            (value) => {
                process.env['CORS_CREDENTIALS'] = value;

                expect(corsConfig().credentials).toBe(false);
            }
        );
    });

    describe('maxAge', () => {
        it('usa 86400 por defecto', () => {
            expect(corsConfig().maxAge).toBe(86400);
        });

        it('respeta el valor de la variable', () => {
            process.env['CORS_MAX_AGE'] = '3600';

            expect(corsConfig().maxAge).toBe(3600);
        });
    });
});
