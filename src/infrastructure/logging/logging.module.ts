import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";

import { LoggingConfig } from "@/interfaces";

import { buildLoggerParams } from "./logger.config";


/**
 * Logging de la aplicación, con la configuración INYECTADA igual que la base
 * de datos o CORS: nada de leer `process.env` suelto dentro del logger.
 *
 * `LoggerModule` monta su propio middleware, que es el que abre el contexto de
 * petición (`AsyncLocalStorage`) del que sale el `traceId` en cada línea, y el
 * que genera ese identificador y lo devuelve en el header `X-Request-Id`.
 */
/**
 * Global como el de configuración: escribir en el log es algo que hace
 * cualquier capa —un publicador de eventos, un adaptador de persistencia, un
 * guard—, y sin esto habría que acordarse de importar este módulo en cada uno
 * de los que inyecte `PinoLogger`. Un import olvidado se descubre en tiempo de
 * arranque, y siempre en el módulo que menos se toca.
 */
@Global()
@Module({
    imports: [
        LoggerModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) =>
                buildLoggerParams(configService.getOrThrow<LoggingConfig>('logging')),
        }),
    ],

    // Reexportado para que quien inyecte `PinoLogger` —empezando por el filtro
    // de excepciones global— lo encuentre importando solo este módulo.
    exports: [LoggerModule],
})

export class LoggingModule { };
