import { Logger, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PinoLogger } from "nestjs-pino";

import { DatabaseConfig } from "@/interfaces";

// Por ruta directa y no desde el barrel `@/infrastructure`, que exporta
// también este módulo y haría una dependencia circular.
import { LoggingModule } from "../logging/logging.module";
import { DatabaseLogger } from "../logging/database.logger";


/**
 * Conexión a Postgres como adaptador de infraestructura.
 * - forRootAsync: la config se INYECTA (testeable, sin globals dispersos).
 * - getOrThrow: si falta la config, falla claro al instante.
 * - retryAttempts/retryDelay: reintenta si la base aún no está lista.
 * - autoLoadEntities: cada context registra sus entidades con forFeature.
 * - logger: las consultas salen por pino, con el traceId de la petición que
 *   las disparó. Antes iban a la consola por su cuenta, sin nada que las atara
 *   a ninguna.
 */
@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [LoggingModule],
            inject: [ConfigService, PinoLogger],
            useFactory: (configService: ConfigService, pinoLogger: PinoLogger) => {
                const db = configService.getOrThrow<DatabaseConfig>('database');
                const logger = new Logger('database-module');

                if (db.synchronize) {
                    logger.warn('synchronize=true - solo para desarrollo');
                };

                return {
                    type: 'postgres' as const,
                    host: db.host,
                    port: db.port,
                    username: db.username,
                    password: db.password,
                    database: db.database,
                    autoLoadEntities: true,
                    synchronize: db.synchronize,

                    // `logging` ya no se pasa. Con un logger propio, TypeORM
                    // llama a sus métodos siempre y no consulta esa opción, así
                    // que dejarla aquí haría creer que apaga algo. Quien decide
                    // si se registran las consultas es el logger, y por eso
                    // recibe el mismo valor.
                    logger: new DatabaseLogger(pinoLogger, db.logging),
                    ssl: db.ssl ? { rejectUnauthorized: false } : false,
                    // Manejo de errores de conexión:
                    retryAttempts: 10,
                    retryDelay: 3000,
                    verboseRetryLog: true,
                };
            }
        })
    ],
})

export class DatabaseModule { }