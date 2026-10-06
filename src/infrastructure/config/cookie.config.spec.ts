import cookieConfig from './cookie.config';


/**
 * registerAs devuelve la propia factory, así que se puede invocar directamente
 * sin levantar un módulo de Nest.
 *
 * Aquí se prueba una sola decisión, pero de las que no avisan cuando salen mal.
 * Una cookie con secure en el entorno equivocado no lanza ningún error, el
 * navegador simplemente no la guarda, y lo que se ve del otro lado es un 401 sin
 * explicación.
 */
describe('cookieConfig', () => {
    const ORIGINAL_ENV = process.env;

    beforeEach(() => {
        process.env = { ...ORIGINAL_ENV };
    });

    afterAll(() => {
        process.env = ORIGINAL_ENV;
    });


    it.each(['development', 'test'])('en %s va sin secure, porque se sirve por http plano', (env) => {
        process.env['NODE_ENV'] = env;

        expect(cookieConfig().secure).toBe(false);
    });


    it('en production va con secure', () => {
        process.env['NODE_ENV'] = 'production';

        expect(cookieConfig().secure).toBe(true);
    });
});
