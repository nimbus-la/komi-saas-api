// class-transformer/class-validator necesitan los decoradores registrados.
// En la app lo carga @nestjs/core; en un unitario aislado hay que pedirlo.
import 'reflect-metadata';

import { validateEnv } from './env.validation';


const VALID_ENV = {
    NODE_ENV: 'development',
    DB_HOST: 'localhost',
    DB_PORT: '5432',
    DB_USER: 'erp_user',
    DB_PASSWORD: 'erp_password',
    DB_NAME: 'erp',
    CORS_ORIGINS: 'http://localhost:3000',
};

const envWithout = (key: string): Record<string, unknown> => {
    const env: Record<string, unknown> = { ...VALID_ENV };
    delete env[key];

    return env;
};


describe('validateEnv', () => {
    it('acepta una configuración mínima válida', () => {
        expect(() => validateEnv({ ...VALID_ENV })).not.toThrow();
    });

    it('convierte los numéricos que llegan como string', () => {
        const validated = validateEnv({ ...VALID_ENV, CORS_MAX_AGE: '3600' });

        expect(validated.DB_PORT).toBe(5432);
        expect(validated.CORS_MAX_AGE).toBe(3600);
    });

    describe('variables obligatorias', () => {
        /**
         * NODE_ENV manda sobre reglas de seguridad (localhost en CORS, '*'),
         * así que ausente debe impedir el arranque, no asumir un default.
         */
        it('exige NODE_ENV', () => {
            expect(() => validateEnv(envWithout('NODE_ENV'))).toThrow(/NODE_ENV/);
        });

        it('rechaza un NODE_ENV desconocido', () => {
            expect(() => validateEnv({ ...VALID_ENV, NODE_ENV: 'staging' })).toThrow(/NODE_ENV/);
        });

        it('exige CORS_ORIGINS', () => {
            expect(() => validateEnv(envWithout('CORS_ORIGINS'))).toThrow(/CORS_ORIGINS/);
        });

        it('rechaza CORS_ORIGINS vacío', () => {
            expect(() => validateEnv({ ...VALID_ENV, CORS_ORIGINS: '' })).toThrow(/CORS_ORIGINS/);
        });
    });

    describe('CORS_CREDENTIALS', () => {
        it('es opcional', () => {
            expect(() => validateEnv({ ...VALID_ENV })).not.toThrow();
        });

        it.each(['true', 'false'])("acepta el literal '%s'", (value) => {
            expect(() => validateEnv({ ...VALID_ENV, CORS_CREDENTIALS: value })).not.toThrow();
        });

        /**
         * Sin esta validación, un 'False' llegaría a la config y habría que
         * confiar en cómo lo interprete el parseo.
         */
        it.each(['False', 'TRUE', '0', '1', 'yes'])(
            "rechaza '%s' al arrancar",
            (value) => {
                expect(() => validateEnv({ ...VALID_ENV, CORS_CREDENTIALS: value }))
                    .toThrow(/CORS_CREDENTIALS/);
            }
        );
    });

    it('rechaza un CORS_MAX_AGE no numérico', () => {
        expect(() => validateEnv({ ...VALID_ENV, CORS_MAX_AGE: 'un-dia' }))
            .toThrow(/CORS_MAX_AGE/);
    });
});
