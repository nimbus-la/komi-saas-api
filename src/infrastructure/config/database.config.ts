import { registerAs } from "@nestjs/config";
import { DatabaseConfig } from "@/interfaces";
import { Enviroment } from "./env.validation";


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
        // Las consultas SQL solo se escriben en el log al desarrollar. En
        // producción serían ruido, y las que fallan se registran de todos modos.
        logging: process.env['NODE_ENV'] === Enviroment.Development,
        ssl: process.env['DB_SSL'] === 'true',
    })
);