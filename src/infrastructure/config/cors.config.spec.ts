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
        });
    });

    describe('asterisco', () => {
        // Con la sesión en cookies, un origen comodín deja el login sin funcionar.
        it.each(['development', 'production'])('impide arrancar en %s', (env) => {
            process.env['NODE_ENV'] = env;
            process.env['CORS_ORIGINS'] = '*,https://a.com';

            expect(() => corsConfig()).toThrow(/cookies/);
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
});
