import { registerAs } from "@nestjs/config";

import { LOG_LEVELS, LoggingConfig, LogLevel } from "@/interfaces";

import { Enviroment } from "./env.validation";


/**
 * Configuración del log bajo el namespace 'logging'. Se lee desde aquí y nunca
 * con `process.env` disperso por el código.
 *
 * Cada valor tiene un default razonable por entorno, así que la aplicación
 * loguea bien sin declarar ninguna variable. Las variables solo sirven para
 * apartarse de ese default.
 */


const isLogLevel = (value: string): value is LogLevel =>
    (LOG_LEVELS as readonly string[]).includes(value);


/**
 * En producción va en `info`, que deja lo relevante sin el ruido de la
 * depuración. En las pruebas va en `silent` para que la salida de Jest siga
 * siendo legible, y al desarrollar en `debug`, que es donde interesa el detalle.
 */
const defaultLevel = (environment: string | undefined): LogLevel => {
    if (environment === Enviroment.Production) {
        return 'info';
    };

    return environment === Enviroment.Test ? 'silent' : 'debug';
};


export default registerAs(
    'logging',
    (): LoggingConfig => {
        const environment = process.env['NODE_ENV'];
        const isProduction = environment === Enviroment.Production;

        const requested = process.env['LOG_LEVEL']?.trim().toLowerCase();

        return {
            level: requested !== undefined && isLogLevel(requested)
                ? requested
                : defaultLevel(environment),

            // pino-pretty es dependencia de desarrollo y en producción no
            // está instalado, así que activarlo allí tumbaría el arranque. Por
            // eso en producción la respuesta es que no, diga lo que diga la
            // variable.
            pretty: !isProduction && process.env['LOG_PRETTY'] !== 'false',

            // El cuerpo de una petición puede traer datos personales del
            // cliente, así que en producción no se registra. Al desarrollar se
            // puede apagar cuando se trabaja con datos reales.
            logRequestPayload: !isProduction && process.env['LOG_REQUEST_PAYLOAD'] !== 'false',
        };
    }
);
