import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";

import { buildLoggerParams } from "./logger.config";


/**
 * Logging de la aplicación, con la configuración INYECTADA igual que la base
 * de datos o CORS: nada de leer `process.env` suelto dentro del logger.
 *
 * `LoggerModule` monta su propio middleware, que es el que abre el contexto de
 * petición (`AsyncLocalStorage`) del que sale el `traceId` en cada línea. Ese
 * middleware corre DESPUÉS del `requestIdMiddleware` de `main.ts`, que se
 * registra directamente sobre Express al arrancar; por eso pino encuentra el
 * identificador ya puesto y no tiene que fabricar otro.
 */
@Module({
    imports: [
        LoggerModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => buildLoggerParams(configService),
        }),
    ],
})

export class LoggingModule { };
