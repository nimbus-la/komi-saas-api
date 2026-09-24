import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DataSource } from 'typeorm';


/**
 * Base de datos temporal para pruebas e2e que necesitan Postgres de verdad.
 *
 * Crea una base con nombre único, le carga el esquema real de public/db y la
 * borra al terminar, así las pruebas nunca tocan la base de desarrollo. Usa las
 * credenciales del .env, igual que la aplicación, y necesita el contenedor
 * arriba (`docker compose up -d`).
 */

const ROOT = join(__dirname, '..', '..');
const DB_DIR = join(ROOT, 'public', 'db');

const loadEnv = (): void => {
    try {
        process.loadEnvFile(join(ROOT, '.env'));
    } catch {
        // Sin .env se usan las variables del entorno o los valores por defecto.
    }
};

/**
 * 01-init.sql incluye la tabla de sucursales con \ir, que es un comando de psql
 * y el driver pg no lo entiende. Se reemplaza por el contenido del archivo.
 */
const readInitSchema = (): string =>
    readFileSync(join(DB_DIR, '01-init.sql'), 'utf8').replace(
        /^\\ir\s+(\S+)\s*$/gm,
        (_, file: string) => readFileSync(join(DB_DIR, file), 'utf8'),
    );

export interface TemporaryDatabase {
    name: string;
    connection: { host: string; port: number; username: string; password: string };
    /** Ejecuta SQL directo contra la base temporal. */
    query: <T = unknown>(sql: string, params?: unknown[]) => Promise<T[]>;
    drop: () => Promise<void>;
}

export const createTemporaryDatabase = async (prefix: string): Promise<TemporaryDatabase> => {
    loadEnv();

    const connection = {
        host: process.env['DB_HOST'] ?? 'localhost',
        port: parseInt(process.env['DB_PORT'] ?? '5432', 10),
        username: process.env['DB_USER'] ?? 'erp_user',
        password: process.env['DB_PASSWORD'] ?? 'erp_password',
    };
    const name = `${prefix}_${Date.now()}_${process.pid}`;

    // La base de desarrollo solo se usa para crear y borrar la temporal.
    const onDevelopmentDatabase = async (sql: string): Promise<void> => {
        const admin = new DataSource({ type: 'postgres', ...connection, database: process.env['DB_NAME'] ?? 'erp' });
        await admin.initialize();
        try {
            await admin.query(sql);
        } finally {
            await admin.destroy();
        }
    };

    await onDevelopmentDatabase(`CREATE DATABASE "${name}"`);

    const temporary = new DataSource({ type: 'postgres', ...connection, database: name });
    await temporary.initialize();
    await temporary.query(readInitSchema());

    return {
        name,
        connection,
        query: <T>(sql: string, params: unknown[] = []) => temporary.query<T[]>(sql, params),
        drop: async () => {
            await temporary.destroy();
            await onDevelopmentDatabase(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`);
        },
    };
};
