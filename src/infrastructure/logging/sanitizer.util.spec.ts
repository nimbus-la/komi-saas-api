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


    it('los valores sueltos pasan tal cual', () => {
        expect(sanitize('texto')).toBe('texto');
        expect(sanitize(42)).toBe(42);
        expect(sanitize(null)).toBeNull();
        expect(sanitize(undefined)).toBeUndefined();
    });
});
