import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import corsConfig from "./cors.config";
import databaseConfig from "./database.config";
import { validateEnv } from "./env.validation";
import jwtConfig from "./jwt.config";
import loggingConfig from "./logging.config";


/**
 * Centraliza la carga del .env, la validación y la configuración tipada.
 * isGlobal => ConfigService disponible en toda la app sin reimportar.
 */
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            cache: true,
            envFilePath: ['.env'],
            load: [databaseConfig, corsConfig, jwtConfig, loggingConfig],
            validate: validateEnv,
        }),
    ],
})

export class AppConfigModule {};