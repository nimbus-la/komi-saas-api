import { readableQuery } from './query-format.util';


describe('readableQuery', () => {
    describe('valores en su sitio', () => {
        /**
         * La razón de existir: con los marcadores por un lado y los valores por
         * otro había que contar `$1`, `$2` con el dedo para saber qué se buscó.
         */
        it('pone cada valor donde va', () => {
            const query = readableQuery(
                'SELECT * FROM tenants WHERE slug = $1 AND is_deleted = $2',
                ['mi-negocio', false],
            );

            expect(query).toBe("SELECT * FROM tenants WHERE slug = 'mi-negocio' AND is_deleted = false");
        });


        /** `$10` no puede confundirse con `$1` seguido de un cero. */
        it('no confunde $1 con $10', () => {
            const parameters = Array.from({ length: 10 }, (_, index) => index + 1);

            expect(readableQuery('VALUES ($1, $10)', parameters)).toBe('VALUES (1, 10)');
        });


        it('escribe null, fechas y arreglos como se leen', () => {
            const fecha = new Date('2026-09-04T10:00:00.000Z');

            expect(readableQuery('$1 $2 $3', [null, fecha, ['a', 'b']]))
                .toBe("NULL '2026-09-04T10:00:00.000Z' ('a', 'b')");
        });


        /** Un hash de argon2 no tiene por qué acabar entero en la consola. */
        it('corta los valores largos', () => {
            const hash = '$argon2id$v=19$m=65536,t=3,p=4$'.padEnd(200, 'x');

            const query = readableQuery('INSERT INTO users(password_hash) VALUES ($1)', [hash]);

            expect(query.length).toBeLessThan(150);
            expect(query).toContain('...');
        });


        it('sin parámetros deja la consulta como está', () => {
            expect(readableQuery('SELECT 1', [])).toBe('SELECT 1');
            expect(readableQuery('SELECT 1', undefined)).toBe('SELECT 1');
        });


        /** Si faltan valores, el marcador se queda: mentir sería peor. */
        it('respeta el marcador que no tiene valor', () => {
            expect(readableQuery('WHERE a = $1 AND b = $2', ['uno'])).toBe("WHERE a = 'uno' AND b = $2");
        });
    });


    describe('columnas', () => {
        /**
         * Un SELECT de TypeORM son seiscientos caracteres de
         * `"X"."campo" AS "X_campo"` para decir "traé el tenant".
         */
        it('resume la lista larga de alias', () => {
            const columns = Array.from(
                { length: 9 },
                (_, index) => `"TenantEntity"."campo_${index}" AS "TenantEntity_campo_${index}"`,
            ).join(', ');

            const query = readableQuery(`SELECT ${columns} FROM "tenants" WHERE id = $1`, ['x']);

            expect(query).toBe(`SELECT 9 cols FROM "tenants" WHERE id = 'x'`);
        });


        /** Con pocas columnas la lista dice más que el resumen. */
        it('deja en paz una lista corta', () => {
            expect(readableQuery('SELECT id, name FROM tenants', [])).toBe('SELECT id, name FROM tenants');
        });


        it('no toca lo que no es un SELECT', () => {
            const query = readableQuery('UPDATE tenants SET name = $1 WHERE id = $2', ['Komi', 42]);

            expect(query).toBe("UPDATE tenants SET name = 'Komi' WHERE id = 42");
        });
    });


    it('una consulta enorme se corta antes de llenar la pantalla', () => {
        const query = readableQuery(`INSERT INTO x VALUES ${'(1),'.repeat(500)}`, []);

        expect(query.length).toBeLessThan(700);
        expect(query.endsWith('...')).toBe(true);
    });
});
