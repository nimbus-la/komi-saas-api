import { Logger, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PinoLogger } from "nestjs-pino";

import { DatabaseConfig } from "@/interfaces";

// Por ruta directa y no desde el barrel `@/infrastructure`: ese indice exporta
// tambien este modulo, y importarlo desde ahi seria una dependencia circular.
import { LoggingModule } from "../logging/logging.module";
import { DatabaseLogger } from "../logging/database.logger";


/**
 * Conexión a Postgres como adaptador de infraestructura.
 * - forRootAsync: la config se INYECTA (testeable, sin globals dispersos).
 * - getOrThrow: si falta la config, falla claro al instante.
 * - retryAttempts/retryDelay: reintenta si la base aún no está lista.
 * - autoLoadEntities: cada context registra sus entidades con forFeature.
 * - logger: las consultas salen por pino, con el traceId de la petición que
 *   las disparó. Antes iban por su cuenta a la consola, sin nada que las atara
 *   a nada.
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

                    /**
                     * `logging` ya no se pasa: con un logger propio, TypeORM
                     * llama a sus métodos SIEMPRE y no lo consulta, así que
                     * dejarlo aquí haría creer que apaga algo. La decisión de
                     * registrar o no las consultas la toma el logger, y para
                     * eso recibe el mismo valor.
                     */
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