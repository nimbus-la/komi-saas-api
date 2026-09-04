import { REDACTED, sanitize } from './sanitizer.util';


describe('sanitize', () => {
    it('deja intacto lo que no es sensible', () => {
        expect(sanitize({ username: 'ana', edad: 30, activo: true })).toEqual({
            username: 'ana',
            edad: 30,
            activo: true,
        });
    });


    it('tapa el valor de un campo sensible y conserva la clave', () => {
        expect(sanitize({ username: 'ana', password: 'mi-clave' })).toEqual({
            username: 'ana',
            password: REDACTED,
        });
    });


    /** La razón de que exista: `redact` de pino solo llega a un nivel. */
    it('baja hasta donde haga falta', () => {
        const sanitized = sanitize({ a: { b: { c: { credentials: { password: 'hondo' } } } } });

        expect(JSON.stringify(sanitized)).not.toContain('hondo');
    });


    it('no distingue mayúsculas: Password, PASSWORD y password son lo mismo', () => {
        const sanitized = sanitize({ Password: 'x', REFRESHTOKEN: 'y', accessToken: 'z' }) as Record<string, unknown>;

        expect(Object.values(sanitized)).toEqual([REDACTED, REDACTED, REDACTED]);
    });


    it('recorre los arreglos', () => {
        const sanitized = sanitize([{ password: 'uno' }, { password: 'dos' }]);

        expect(sanitized).toEqual([{ password: REDACTED }, { password: REDACTED }]);
    });


    /**
     * El cuerpo saneado es una copia: el que sigue su camino hacia el
     * controlador tiene que llegar entero.
     */
    it('no toca el objeto original', () => {
        const original = { password: 'mi-clave', nested: { token: 'abc' } };

        sanitize(original);

        expect(original.password).toBe('mi-clave');
        expect(original.nested.token).toBe('abc');
    });


    /** Un payload de treinta niveles casi siempre es un error de quien lo manda. */
    it('corta a partir de cierta profundidad en vez de recorrerlo entero', () => {
        let deep: Record<string, unknown> = { fin: 'valor' };

        for (let i = 0; i < 12; i += 1) {
            deep = { nivel: deep };
        };

        expect(JSON.stringify(sanitize(deep))).toContain('PROFUNDIDAD MAXIMA');
    });


    describe('tamano acotado', () => {
        /** Un cuerpo con una imagen en base64 son varios megabytes. */
        it('corta los textos larguisimos y dice cuanto falto', () => {
            const largo = 'x'.repeat(2_500);

            const sanitized = sanitize({ imagen: largo }) as Record<string, string>;

            expect(sanitized['imagen']!.length).toBeLessThan(2_100);
            expect(sanitized['imagen']).toContain('[+500 caracteres]');
        });


        it('deja en paz un texto normal', () => {
            expect(sanitize({ nombre: 'ana' })).toEqual({ nombre: 'ana' });
        });


        /** Una consulta de diez mil filas no puede ser diez mil lineas de log. */
        it('resume los arreglos largos', () => {
            const filas = Array.from({ length: 50 }, (_, index) => index);

            const sanitized = sanitize(filas) as unknown[];

            expect(sanitized).toHaveLength(21);
            expect(sanitized[20]).toBe('[+30 elementos]');
        });


        it('deja en paz un arreglo corto', () => {
            expect(sanitize([1, 2, 3])).toEqual([1, 2, 3]);
        });
    });


    describe('lo que JSON no sabe escribir', () => {
        /**
         * Una fecha no tiene propiedades propias: recorrerla campo a campo la
         * dejaria en `{}`. Es lo que traen los eventos de dominio en occurredOn.
         */
        it('conserva las fechas', () => {
            const occurredOn = new Date('2026-09-04T10:00:00.000Z');

            expect(sanitize({ occurredOn })).toEqual({ occurredOn: '2026-09-04T10:00:00.000Z' });
        });


        /** Pino tiene su propio serializador de errores y saca mas que este. */
        it('deja el error para que lo serialice pino', () => {
            const err = new TypeError('roto');

            expect(sanitize({ err })).toEqual({ err });
        });
    });


    it('los valores sueltos pasan tal cual', () => {
        expect(sanitize('texto')).toBe('texto');
        expect(sanitize(42)).toBe(42);
        expect(sanitize(null)).toBeNull();
        expect(sanitize(undefined)).toBeUndefined();
    });
});
