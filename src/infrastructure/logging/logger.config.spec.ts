import { IncomingMessage, ServerResponse } from 'node:http';

import { ConfigService } from '@nestjs/config';
import { Options } from 'pino-http';

import { Enviroment } from '../config/env.validation';
import { RequestWithId } from '../http/request-id.middleware';
import { buildLoggerParams } from './logger.config';


/**
 * `ConfigService` mínimo: solo `NODE_ENV` y `LOG_LEVEL`, que es todo lo que
 * consulta la fábrica. Evita levantar el módulo de configuración entero.
 */
const createConfigService = (env: Enviroment, logLevel?: string): ConfigService =>
    ({
        getOrThrow: () => env,
        get: () => logLevel,
    }) as unknown as ConfigService;


/** Los `pinoHttp` de la fábrica, ya tipados: nunca es un stream ni una tupla. */
const buildOptions = (env: Enviroment, logLevel?: string): Options =>
    buildLoggerParams(createConfigService(env, logLevel)).pinoHttp as Options;


/** Petición mínima para `genReqId`, con los headers que el respaldo consulta. */
const createRequest = (
    headers: Record<string, string> = {},
    requestId?: string
): IncomingMessage => {
    const request = { headers } as unknown as RequestWithId;

    if (requestId !== undefined) {
        request.requestId = requestId;
    };

    return request as unknown as IncomingMessage;
};



describe('buildLoggerParams', () => {
    describe('nivel de log', () => {
        it('respeta LOG_LEVEL cuando está definido, sin importar el entorno', () => {
            expect(buildOptions(Enviroment.Development, 'warn').level).toBe('warn');
            expect(buildOptions(Enviroment.Production, 'trace').level).toBe('trace');
        });


        it('sin LOG_LEVEL cae a debug en desarrollo y a info en el resto', () => {
            expect(buildOptions(Enviroment.Development).level).toBe('debug');
            expect(buildOptions(Enviroment.Production).level).toBe('info');
            expect(buildOptions(Enviroment.Test).level).toBe('info');
        });
    });


    describe('salida', () => {
        it('usa pino-pretty solo en desarrollo', () => {
            expect(buildOptions(Enviroment.Development).transport).toMatchObject({ target: 'pino-pretty' });
        });


        /**
         * En producción la salida DEBE ser JSON por línea: es lo que un
         * agregador sabe indexar, y `pino-pretty` además cuesta un worker.
         */
        it('en producción no monta transporte: JSON crudo', () => {
            expect(buildOptions(Enviroment.Production).transport).toBeUndefined();
        });
    });


    describe('identificador de la petición', () => {
        /**
         * La razón de ser de toda la configuración: el `traceId` del log tiene
         * que ser el MISMO que ya puso `requestIdMiddleware`, no uno nuevo.
         */
        it('reutiliza el requestId que dejó el middleware', () => {
            const genReqId = buildOptions(Enviroment.Development).genReqId!;
            const request = createRequest({}, 'abc123def456');

            expect(genReqId(request, {} as ServerResponse)).toBe('abc123def456');
        });


        it('sin middleware delante, respeta el identificador válido del cliente', () => {
            const genReqId = buildOptions(Enviroment.Development).genReqId!;
            const request = createRequest({ 'x-request-id': 'id-del-cliente-1' });

            expect(genReqId(request, {} as ServerResponse)).toBe('id-del-cliente-1');
        });


        /**
         * Además de devolverlo, lo deja escrito en la petición: así el filtro de
         * excepciones lee ese mismo valor y el cuerpo del error, el header y el
         * log siguen coincidiendo.
         */
        it('sin middleware ni header, genera uno y lo deja en la petición', () => {
            const genReqId = buildOptions(Enviroment.Development).genReqId!;
            const request = createRequest();

            const generated = genReqId(request, {} as ServerResponse);

            expect(generated).toMatch(/^[a-f0-9]{12}$/);
            expect((request as unknown as RequestWithId).requestId).toBe(generated);
        });
    });


    describe('mensaje de la petición terminada', () => {
        /** Solo ASCII: una flecha UTF-8 se ve como `ÔåÆ` en una consola que no va en UTF-8. */
        it('dice método, ruta, estado y duración, en ASCII', () => {
            const { customSuccessMessage } = buildOptions(Enviroment.Development);

            const message = customSuccessMessage!(
                { method: 'GET', url: '/menus' } as IncomingMessage,
                { statusCode: 200 } as ServerResponse,
                12
            );

            expect(message).toBe('GET /menus -> 200 | 12 ms');
        });


        /** Sin duración: `pino-http` no se la pasa a este callback. */
        it('en error dice el tipo de error en lugar de la duración', () => {
            const { customErrorMessage } = buildOptions(Enviroment.Development);

            const message = customErrorMessage!(
                { method: 'POST', url: '/auth/login' } as IncomingMessage,
                { statusCode: 500 } as ServerResponse,
                new TypeError('roto')
            );

            expect(message).toBe('POST /auth/login -> 500 | TypeError');
        });
    });


    describe('nivel de la linea de peticion', () => {
        const levelFor = (statusCode: number, error?: Error) => {
            const { customLogLevel } = buildOptions(Enviroment.Development);

            return customLogLevel!(
                {} as IncomingMessage,
                { statusCode } as ServerResponse,
                error
            );
        };


        /**
         * Por defecto pino-http lo escribe todo en `info`: con LOG_LEVEL=warn
         * en produccion no se veia ni un 500.
         */
        it('sube de nivel segun como termino la peticion', () => {
            expect(levelFor(200)).toBe('info');
            expect(levelFor(304)).toBe('info');
            expect(levelFor(400)).toBe('warn');
            expect(levelFor(404)).toBe('warn');
            expect(levelFor(500)).toBe('error');
            expect(levelFor(503)).toBe('error');
        });


        it('un error colgando de la respuesta es error, sea cual sea el estado', () => {
            expect(levelFor(200, new TypeError('roto'))).toBe('error');
        });
    });


    describe('serializadores', () => {
        /**
         * Los de serie vuelcan los headers completos, y ahí viaja el
         * `Authorization`. Este es el chequeo de que no se filtra.
         */
        it('la petición se reduce a método y ruta: ni headers ni token', () => {
            const { serializers } = buildOptions(Enviroment.Development);

            const serialized = serializers!['req']!({
                method: 'GET',
                url: '/menus',
                headers: { authorization: 'Bearer un-token-secreto' },
            });

            expect(serialized).toEqual({ method: 'GET', url: '/menus' });
        });
    });
});
