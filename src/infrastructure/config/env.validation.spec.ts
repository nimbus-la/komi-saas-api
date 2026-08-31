// class-transformer/class-validator necesitan los decoradores registrados.
// En la app lo carga @nestjs/core; en un unitario aislado hay que pedirlo.
import 'reflect-metadata';

import { validateEnv } from './env.validation';


/** Exactamente 32 caracteres: el mínimo que exige el contrato. */
const SECRET_32 = 'a'.repeat(32);

const VALID_ENV = {
    NODE_ENV: 'development',
    DB_HOST: 'localhost',
    DB_PORT: '5432',
    DB_USER: 'erp_user',
    DB_PASSWORD: 'erp_password',
    DB_NAME: 'erp',
    CORS_ORIGINS: 'http://localhost:3000',
    JWT_SECRET: SECRET_32,
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

        /**
         * Con él se firman todos los access token. Ausente, la app arrancaría
         * firmando con cadena vacía y cualquiera podría fabricar tokens válidos.
         */
        it('exige JWT_SECRET', () => {
            expect(() => validateEnv(envWithout('JWT_SECRET'))).toThrow(/JWT_SECRET/);
        });
    });


    /**
     * Los tres valores que gobiernan la sesión. El secreto tiene mínimo duro; los
     * dos TTL son opcionales porque la config tiene defaults, pero si vienen se
     * validan para que un '0' no deje tokens que nacen expirados.
     */
    describe('JWT', () => {
        it('acepta un secreto de exactamente 32 caracteres', () => {
            expect(() => validateEnv({ ...VALID_ENV, JWT_SECRET: SECRET_32 })).not.toThrow();
        });

        it('rechaza un secreto de 31 caracteres', () => {
            expect(() => validateEnv({ ...VALID_ENV, JWT_SECRET: 'a'.repeat(31) }))
                .toThrow(/JWT_SECRET/);
        });

        it('JWT_ACCESS_TTL es opcional', () => {
            expect(() => validateEnv(envWithout('JWT_ACCESS_TTL'))).not.toThrow();
        });

        it('convierte JWT_ACCESS_TTL de string a número', () => {
            expect(validateEnv({ ...VALID_ENV, JWT_ACCESS_TTL: '900' }).JWT_ACCESS_TTL).toBe(900);
        });

        // Un access token de menos de un minuto obligaría a refrescar sin parar.
        it('rechaza un JWT_ACCESS_TTL menor a 60 segundos', () => {
            expect(() => validateEnv({ ...VALID_ENV, JWT_ACCESS_TTL: '30' }))
                .toThrow(/JWT_ACCESS_TTL/);
        });

        it('JWT_REFRESH_TTL_DAYS es opcional', () => {
            expect(() => validateEnv(envWithout('JWT_REFRESH_TTL_DAYS'))).not.toThrow();
        });

        it('convierte JWT_REFRESH_TTL_DAYS de string a número', () => {
            expect(validateEnv({ ...VALID_ENV, JWT_REFRESH_TTL_DAYS: '7' }).JWT_REFRESH_TTL_DAYS)
                .toBe(7);
        });

        // El valor se lee en DÍAS. Un 0 dejaría sesiones muertas al nacer.
        it('rechaza un JWT_REFRESH_TTL_DAYS de 0 días', () => {
            expect(() => validateEnv({ ...VALID_ENV, JWT_REFRESH_TTL_DAYS: '0' }))
                .toThrow(/JWT_REFRESH_TTL_DAYS/);
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
