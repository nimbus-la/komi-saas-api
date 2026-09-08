import cookieConfig from './cookie.config';


/**
 * `registerAs` devuelve la propia factory, así que se puede invocar
 * directamente sin levantar un módulo de Nest.
 *
 * Lo que se prueba aquí es una sola decisión, pero de las que no avisan cuando
 * salen mal: una cookie con los atributos equivocados no lanza ningún error, el
 * navegador simplemente no la guarda o no la manda, y el síntoma que se ve del
 * otro lado es un 401 sin explicación.
 */
describe('cookieConfig', () => {
    const ORIGINAL_ENV = process.env;

    beforeEach(() => {
        process.env = { ...ORIGINAL_ENV };
        delete process.env['COOKIE_DOMAIN'];
        delete process.env['COOKIE_SAME_SITE'];
        process.env['NODE_ENV'] = 'development';
    });

    afterAll(() => {
        process.env = ORIGINAL_ENV;
    });


    describe('sameSite', () => {
        // El default importa: es el que aplica a todo despliegue que no toque la
        // variable, y el único que funciona en todos los navegadores.
        it("sin la variable queda en 'lax'", () => {
            expect(cookieConfig().sameSite).toBe('lax');
        });


        it.each(['lax', 'strict', 'none'] as const)("respeta '%s'", (valor) => {
            process.env['COOKIE_SAME_SITE'] = valor;

            expect(cookieConfig().sameSite).toBe(valor);
        });


        it('tolera espacios alrededor', () => {
            process.env['COOKIE_SAME_SITE'] = '  none  ';

            expect(cookieConfig().sameSite).toBe('none');
        });


        /**
         * `env.validation` rechaza cualquier otro valor y la aplicación no
         * arranca, así que hasta aquí solo llega lo válido. Aun así la factory no
         * puede devolver basura si alguien la invoca suelta: cae al default, que
         * es el modo restrictivo, nunca el permisivo.
         */
        it('ante un valor que no reconoce cae al default, no a none', () => {
            process.env['COOKIE_SAME_SITE'] = 'Lax';

            expect(cookieConfig().sameSite).toBe('lax');
        });
    });


    describe('secure', () => {
        it.each(['development', 'test'])('en %s va sin secure, porque se sirve por http plano', (env) => {
            process.env['NODE_ENV'] = env;

            expect(cookieConfig().secure).toBe(false);
        });


        it('en production va con secure', () => {
            process.env['NODE_ENV'] = 'production';

            expect(cookieConfig().secure).toBe(true);
        });


        /**
         * La regla que justifica todo el cambio: el navegador descarta sin avisar
         * cualquier cookie SameSite=None que no venga marcada como segura. Si el
         * entorno pudiera apagar `secure` con `none` puesto, el resultado sería
         * una cookie que jamás se guarda y ningún error que lo explique.
         */
        it('none fuerza secure aunque el entorno diga lo contrario', () => {
            process.env['NODE_ENV'] = 'development';
            process.env['COOKIE_SAME_SITE'] = 'none';

            const config = cookieConfig();

            expect(config.sameSite).toBe('none');
            expect(config.secure).toBe(true);
        });


        // La contracara: forzar secure es exclusivo de `none`. Los otros modos
        // siguen mandando el entorno, o se rompería el desarrollo local.
        it.each(['lax', 'strict'])("con '%s' manda el entorno y no se fuerza nada", (valor) => {
            process.env['NODE_ENV'] = 'development';
            process.env['COOKIE_SAME_SITE'] = valor;

            expect(cookieConfig().secure).toBe(false);
        });
    });


    describe('domain', () => {
        /**
         * Sin dominio la cookie es host-only, que es lo que se quiere: queda atada
         * al host de la API y no viaja a ningún otro subdominio. Poner '.komi.com'
         * la mandaría también a los fronts de todos los restaurantes, y ahí un
         * subdominio comprometido se lleva refresh tokens.
         */
        it('sin la variable queda undefined, o sea host-only', () => {
            expect(cookieConfig().domain).toBeUndefined();
        });


        it.each([['vacía', ''], ['solo espacios', '   ']])('%s también queda undefined', (_caso, valor) => {
            process.env['COOKIE_DOMAIN'] = valor;

            expect(cookieConfig().domain).toBeUndefined();
        });


        it('recorta los espacios del valor', () => {
            process.env['COOKIE_DOMAIN'] = '  .komi.com  ';

            expect(cookieConfig().domain).toBe('.komi.com');
        });
    });
});
