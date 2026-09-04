import { IncomingMessage, ServerResponse } from 'node:http';

import { ConfigService } from '@nestjs/config';
import { pino } from 'pino';
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


    describe('lo que se sabe solo al cerrar la peticion', () => {
        const closing = (req: object, base: object = { res: { statusCode: 200 } }) => {
            const { customSuccessObject } = buildOptions(Enviroment.Development);

            return customSuccessObject!(req as IncomingMessage, {} as ServerResponse, base);
        };


        const user = {
            userId: 'user-1',
            tenantId: 'tenant-42',
            branchId: 'branch-7',
            rolScope: 'ADMIN',
            sessionId: 'sesion-viva',
        };


        it('registra el negocio, el usuario, la sucursal y el alcance del rol', () => {
            expect(closing({ user })).toMatchObject({
                tenantId: 'tenant-42',
                userId: 'user-1',
                branchId: 'branch-7',
                rolScope: 'ADMIN',
            });
        });


        /** Identifica una sesion viva y no hace falta para diagnosticar nada. */
        it('no registra el identificador de sesion', () => {
            expect(closing({ user })).not.toHaveProperty('sessionId');
        });


        /**
         * El motivo de hacerlo al cerrar y no en el serializador de la
         * peticion: pino-http serializa el request al ENTRAR, cuando Express
         * todavia no ha parseado el cuerpo ni el guard ha resuelto el usuario.
         */
        it('registra el cuerpo con el que llego la peticion', () => {
            expect(closing({ body: { username: 'ana' } })).toMatchObject({
                body: { username: 'ana' },
            });
        });


        it('conserva lo que ya traia la linea', () => {
            expect(closing({ user }, { res: { statusCode: 201 } })).toMatchObject({
                res: { statusCode: 201 },
            });
        });


        it('una peticion anonima y sin cuerpo no agrega ninguna clave', () => {
            expect(closing({})).toEqual({ res: { statusCode: 200 } });
        });


        /** Express deja `req.body` como objeto vacio en cada GET. */
        it('un cuerpo vacio no se registra', () => {
            expect(closing({ body: {} })).toEqual({ res: { statusCode: 200 } });
        });


        /** El camino del error tiene que enterarse igual que el del exito. */
        it('el camino del error registra lo mismo', () => {
            const { customErrorObject } = buildOptions(Enviroment.Development);

            const record = customErrorObject!(
                { user, body: { username: 'ana' } } as unknown as IncomingMessage,
                {} as ServerResponse,
                new TypeError('roto'),
                {}
            );

            expect(record).toMatchObject({ tenantId: 'tenant-42', body: { username: 'ana' } });
        });
    });


    describe('preflight', () => {
        const ignores = (method: string): boolean => {
            const { autoLogging } = buildOptions(Enviroment.Development);

            return (autoLogging as { ignore: (req: IncomingMessage) => boolean })
                .ignore({ method } as IncomingMessage);
        };


        it('el OPTIONS del navegador no se registra: lo responde CORS', () => {
            expect(ignores('OPTIONS')).toBe(true);
        });


        it('el resto de peticiones si', () => {
            expect(ignores('GET')).toBe(false);
            expect(ignores('POST')).toBe(false);
        });
    });


    describe('serializadores', () => {
        it('de la petición registra método, ruta y headers', () => {
            const { serializers } = buildOptions(Enviroment.Development);

            const serialized = serializers!['req']!({
                method: 'POST',
                url: '/auth/login',
                headers: { 'content-type': 'application/json' },
                body: { username: 'ana' },
            });

            // El cuerpo NO: aqui todavia no existe, se agrega al cerrar.
            expect(serialized).toEqual({
                method: 'POST',
                url: '/auth/login',
                headers: { 'content-type': 'application/json' },
            });
        });


        it('de la respuesta registra solo el estado', () => {
            const { serializers } = buildOptions(Enviroment.Development);

            expect(serializers!['res']!({ statusCode: 201, headers: { 'set-cookie': 'x' } }))
                .toEqual({ statusCode: 201 });
        });
    });


    /**
     * La prueba que de verdad importa de esta configuración: se registra el
     * cuerpo y los headers, así que lo único que impide filtrar credenciales
     * es `redact`. Se comprueba contra un pino REAL escribiendo en memoria, no
     * mirando la lista de rutas: una ruta mal escrita pasaría ese chequeo.
     */
    describe('lo que nunca puede quedar escrito', () => {
        const logged = (record: object): string => {
            const written: string[] = [];
            const logger = pino(
                buildOptions(Enviroment.Production),
                { write: (line: string) => { written.push(line); } }
            );

            logger.info(record, 'peticion');

            return written.join('');
        };


        it('tapa el token de acceso que viaja en cada petición autenticada', () => {
            const line = logged({ req: { headers: { authorization: 'Bearer token-secreto' } } });

            expect(line).not.toContain('token-secreto');
            expect(line).toContain('[REDACTADO]');
        });


        it('tapa la contraseña de un login', () => {
            const line = logged({ body: { username: 'ana', password: 'mi-clave' } });

            expect(line).not.toContain('mi-clave');
            // Lo que NO es secreto sigue ahí: sin eso el log no sirve.
            expect(line).toContain('ana');
        });


        it('tapa el refresh token de una renovación', () => {
            const line = logged({ body: { refreshToken: 'refresh-secreto' } });

            expect(line).not.toContain('refresh-secreto');
        });


        it('tapa las cookies', () => {
            const line = logged({ req: { headers: { cookie: 'session=secreto' } } });

            expect(line).not.toContain('session=secreto');
        });
    });
});
