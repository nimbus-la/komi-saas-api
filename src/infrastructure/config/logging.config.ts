import { registerAs } from "@nestjs/config";

import { LOG_LEVELS, LoggingConfig, LogLevel } from "@/interfaces";

import { Enviroment } from "./env.validation";


/**
 * Configuración tipada bajo el namespace 'logging'.
 * Se lee SIEMPRE desde aquí, nunca con process.env disperso por el código.
 *
 * Cada valor tiene un default sensato por entorno, así que la aplicación
 * loguea bien sin declarar una sola variable; las variables solo sirven para
 * apartarse de ese default.
 */


const isLogLevel = (value: string): value is LogLevel =>
    (LOG_LEVELS as readonly string[]).includes(value);


/**
 * Nivel por entorno:
 * - producción: `info`, todo lo relevante sin el ruido de la depuración.
 * - pruebas: `silent`, para que la salida de Jest siga siendo legible.
 * - desarrollo: `debug`, que es donde interesa ver el detalle.
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

            /**
             * `pino-pretty` corre en un worker aparte y es dependencia de
             * desarrollo: en producción no está instalado y activarlo tumbaría
             * el arranque. Por eso, igual que con CORS, en producción es que NO
             * sin importar lo que diga la variable.
             */
            pretty: !isProduction && process.env['LOG_PRETTY'] !== 'false',

            /**
             * El cuerpo de una petición puede traer datos personales del
             * cliente. En producción NUNCA se registra; en desarrollo puede
             * apagarse explícitamente cuando se trabaja con datos reales.
             */
            logRequestPayload: !isProduction && process.env['LOG_REQUEST_PAYLOAD'] !== 'false',
        };
    }
);
