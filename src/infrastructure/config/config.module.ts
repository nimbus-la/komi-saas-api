import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import databaseConfig from "./database.config";
import { validateEnv } from "./env.validation";


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
            load: [databaseConfig],
            validate: validateEnv,
        }),
    ],
})

export class AppConfigModule {};