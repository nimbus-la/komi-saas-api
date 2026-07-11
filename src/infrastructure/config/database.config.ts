import { registerAs } from "@nestjs/config";
import { DatabaseConfig } from "@/interfaces";


/**
 * Configuración tipada bajo el namespace 'database'.
 * Se lee SIEMPRE desde aquí, nunca con process.env disperso por el código.
 */
export default registerAs(
    'database',
    (): DatabaseConfig => ({
        host: process.env['DB_HOST'] ?? 'localhost',
        port: parseInt(process.env['DB_PORT'] ?? '5432', 10),
        username: process.env['DB_USER'] ?? 'postgres',
        password: process.env['DB_PASSWORD'] ?? 'postgres',
        database: process.env['DB_NAME'] ?? 'erp',
        // synchronize NUNCA por defecto: solo si lo activas explícitamente (dev)
        synchronize: process.env['DB_SYNCHRONIZE'] === 'true',
        logging: process.env['DB_LOGGING'] === 'true',
        ssl: process.env['DB_SSL'] === 'true',
    })
);