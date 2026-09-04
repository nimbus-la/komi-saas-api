import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";

import { LoggingConfig } from "@/interfaces";

import { buildLoggerParams } from "./logger.config";


/**
 * El log de la aplicación, con su configuración inyectada igual que la de la
 * base de datos o la de CORS, sin leer `process.env` suelto por dentro.
 *
 * `LoggerModule` monta su propio middleware. Es el que abre el contexto de la
 * petición del que sale el `traceId` en cada línea, y también el que genera ese
 * identificador y lo devuelve en el header `X-Request-Id`.
 */
/**
 * Global como el de configuración, porque escribir en el log lo hace cualquier
 * capa, sea un publicador de eventos, un adaptador de persistencia o un guard.
 * Sin esto habría que importar este módulo en cada uno que inyecte
 * `PinoLogger`, y un import olvidado revienta al arrancar, siempre en el módulo
 * que menos se toca.
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

    // Se reexporta para que quien inyecte `PinoLogger`, empezando por el filtro
    // de excepciones, lo encuentre importando solo este módulo.
    exports: [LoggerModule],
})

export class LoggingModule { };
