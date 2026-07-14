import { Logger, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { DatabaseConfig } from "@/interfaces";


/**
 * Conexión a Postgres como adaptador de infraestructura.
 * - forRootAsync: la config se INYECTA (testeable, sin globals dispersos).
 * - getOrThrow: si falta la config, falla claro al instante.
 * - retryAttempts/retryDelay: reintenta si la base aún no está lista.
 * - autoLoadEntities: cada context registra sus entidades con forFeature.
 */
@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
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
                    logging: db.logging,
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