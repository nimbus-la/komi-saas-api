import { IncomingMessage, ServerResponse } from 'node:http';

import { pino } from 'pino';
import { Options } from 'pino-http';

import { LoggingConfig } from '@/interfaces';

import { RequestWithId } from '../http/request-id.middleware';
import { buildLoggerParams } from './logger.config';


/**
 * Las dos configuraciones que de verdad se dan: la consola de desarrollo y el
 * JSON de produccion. Que un entorno resuelva a una u otra es cosa de
 * `logging.config.ts` y se prueba alli.
 */
const DEV: LoggingConfig = { level: 'debug', pretty: true, logRequestPayload: true };
const PROD: LoggingConfig = { level: 'info', pretty: false, logRequestPayload: false };


/** Los `pinoHttp` de la fábrica, ya tipados: nunca es un stream ni una tupla. */
const buildOptions = (config: LoggingConfig): Options =>
    buildLoggerParams(config).pinoHttp as Options;


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
    describe('salida', () => {
        it('con la consola legible monta pino-pretty', () => {
            expect(buildOptions(DEV).transport).toMatchObject({ target: 'pino-pretty' });
        });


        /** El nivel llega decidido: la fabrica no lo interpreta. */
        it('usa el nivel que le den', () => {
            expect(buildOptions({ ...DEV, level: 'warn' }).level).toBe('warn');
            expect(buildOptions(PROD).level).toBe('info');
        });


        /**
         * En producción la salida DEBE ser JSON por línea: es lo que un
         * agregador sabe indexar, y `pino-pretty` además cuesta un worker.
         */
        it('sin ella no monta transporte: JSON crudo', () => {
            expect(buildOptions(PROD).transport).toBeUndefined();
        });
    });


    describe('identificador de la petición', () => {
        /**
         * La razón de ser de toda la configuración: el `traceId` del log tiene
         * que ser el MISMO que ya puso `requestIdMiddleware`, no uno nuevo.
         */
        it('reutiliza el requestId que dejó el middleware', () => {
            const genReqId = buildOptions(DEV).genReqId!;
            const request = createRequest({}, 'abc123def456');

            expect(genReqId(request, {} as ServerResponse)).toBe('abc123def456');
        });


        it('sin middleware delante, respeta el identificador válido del cliente', () => {
            const genReqId = buildOptions(DEV).genReqId!;
            const request = createRequest({ 'x-request-id': 'id-del-cliente-1' });

            expect(genReqId(request, {} as ServerResponse)).toBe('id-del-cliente-1');
        });


        /**
         * Además de devolverlo, lo deja escrito en la petición: así el filtro de
         * excepciones lee ese mismo valor y el cuerpo del error, el header y el
         * log siguen coincidiendo.
         */
        it('sin middleware ni header, genera uno y lo deja en la petición', () => {
            const genReqId = buildOptions(DEV).genReqId!;
            const request = createRequest();

            const generated = genReqId(request, {} as ServerResponse);

            expect(generated).toMatch(/^[a-f0-9]{12}$/);
            expect((request as unknown as RequestWithId).requestId).toBe(generated);
        });
    });


    describe('mensajes de la peticion', () => {
        /** Solo ASCII: una flecha UTF-8 se ve como `ÔåÆ` en una consola que no va en UTF-8. */
        it('al cerrar dice metodo, ruta y estado, en ASCII', () => {
            const { customSuccessMessage } = buildOptions(DEV);

            const message = customSuccessMessage!(
                { method: 'GET', url: '/menus' } as IncomingMessage,
                { statusCode: 200 } as ServerResponse,
                12
            );

            expect(message).toBe('GET /menus -> 200');
        });


        /** El camino del error usa el mismo mensaje: lo que cambia es el nivel. */
        it('al fallar dice lo mismo', () => {
            const { customErrorMessage } = buildOptions(DEV);

            const message = customErrorMessage!(
                { method: 'POST', url: '/auth/login' } as IncomingMessage,
                { statusCode: 500 } as ServerResponse,
                new TypeError('roto')
            );

            expect(message).toBe('POST /auth/login -> 500');
        });


        /**
         * Si el proceso se cae a mitad de una peticion, la linea de cierre no
         * llega a escribirse: esta es la unica constancia de cual lo provoco.
         */
        /**
         * Va atada a `logRequestPayload` y no al formato: si el cuerpo no se
         * puede registrar, esta linea no aporta nada que la de cierre no diga.
         */
        it('sin permiso para registrar el cuerpo, no se anuncia la entrada', () => {
            expect(buildOptions(PROD).customReceivedMessage).toBeUndefined();
            expect(buildOptions({ ...DEV, logRequestPayload: false }).customReceivedMessage).toBeUndefined();
        });


        it('al entrar la anuncia', () => {
            const { customReceivedMessage } = buildOptions(DEV);

            const message = customReceivedMessage!(
                { method: 'POST', url: '/auth/login' } as IncomingMessage,
                {} as ServerResponse
            );

            expect(message).toBe('--> POST /auth/login');
        });


        /** `originalUrl` conserva la ruta completa aunque un router la reescriba. */
        it('prefiere la ruta original a la reescrita', () => {
            const { customSuccessMessage } = buildOptions(DEV);

            const message = customSuccessMessage!(
                { method: 'GET', url: '/reescrita', originalUrl: '/branch/42' } as unknown as IncomingMessage,
                { statusCode: 200 } as ServerResponse,
                1
            );

            expect(message).toBe('GET /branch/42 -> 200');
        });
    });


    describe('nivel de la linea de peticion', () => {
        const levelFor = (statusCode: number, error?: Error) => {
            const { customLogLevel } = buildOptions(DEV);

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
            const { customSuccessObject } = buildOptions(DEV);

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
        /**
         * El cuerpo sale en la linea de ENTRADA, nunca aqui: repetirlo llena la
         * consola con lo mismo dos veces. Y donde no se anuncia la entrada
         * —produccion— es porque no se puede registrar el cuerpo en absoluto.
         */
        it('el cuerpo no se repite al cerrar', () => {
            expect(closing({ body: { username: 'ana' } })).not.toHaveProperty('payload');

            const { customSuccessObject } = buildOptions(PROD);
            const record = customSuccessObject!(
                { body: { username: 'ana' } } as unknown as IncomingMessage,
                {} as ServerResponse,
                {}
            );

            expect(record).not.toHaveProperty('payload');
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
            const { customErrorObject } = buildOptions(DEV);

            const record = customErrorObject!(
                { user, body: { username: 'ana' } } as unknown as IncomingMessage,
                {} as ServerResponse,
                new TypeError('roto'),
                {}
            );

            expect(record).toMatchObject({ tenantId: 'tenant-42' });
        });
    });


    describe('preflight', () => {
        const ignores = (method: string): boolean => {
            const { autoLogging } = buildOptions(DEV);

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
        /**
         * En desarrollo no se escriben: el mensaje ya dice metodo, ruta y
         * estado, asi que `req` y `res` eran ocho lineas para repetirlo.
         */
        it('en desarrollo no se registra req ni res', () => {
            const { serializers } = buildOptions(DEV);

            // Devuelven undefined, y esa es la razon de que la clave no se
            // escriba. Sin serializador, pino volcaria el ServerResponse entero:
            // doscientas lineas de sockets y temporizadores por peticion.
            expect(serializers!['req']!({})).toBeUndefined();
            expect(serializers!['res']!({})).toBeUndefined();
        });


        it('de la petición registra método, ruta, IP y user-agent', () => {
            const { serializers } = buildOptions(PROD);

            const serialized = serializers!['req']!({
                method: 'POST',
                originalUrl: '/auth/login',
                ip: '::1',
                headers: { 'user-agent': 'curl/8.19.0', authorization: 'Bearer un-token-secreto' },
                socket: {},
            });

            // Los headers NO se vuelcan enteros: ahi viaja el Authorization.
            expect(serialized).toEqual({
                method: 'POST',
                url: '/auth/login',
                ip: '::1',
                userAgent: 'curl/8.19.0',
            });
        });


        it('de la respuesta registra solo el estado', () => {
            const { serializers } = buildOptions(PROD);

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
    /**
     * Lo que de verdad importa de esta configuración: se registra el cuerpo de
     * cada petición, así que lo único que impide filtrar credenciales es que
     * nada se escriba sin sanear.
     *
     * Hay dos caminos y se prueban los dos: el cuerpo pasa por el saneador
     * (recursivo, a cualquier profundidad) y las líneas escritas a mano por
     * `redact` de pino. Se comprueba contra un pino REAL escribiendo en
     * memoria, no mirando la lista de campos: un nombre mal escrito pasaría ese
     * chequeo.
     */
    describe('lo que nunca puede quedar escrito', () => {
        const logged = (record: object): string => {
            const written: string[] = [];
            const logger = pino(
                buildOptions(PROD),
                { write: (line: string) => { written.push(line); } }
            );

            logger.info(record, 'peticion');

            return written.join('');
        };


        /** El cuerpo, tal como lo arma la configuración al entrar la petición. */
        const loggedBody = (body: object): string => {
            const { customReceivedObject } = buildOptions(DEV);

            return logged(
                customReceivedObject!({ body } as unknown as IncomingMessage, {} as ServerResponse) as object
            );
        };


        it('tapa la contraseña de un login', () => {
            const line = loggedBody({ username: 'ana', password: 'mi-clave' });

            expect(line).not.toContain('mi-clave');
            // Lo que NO es secreto sigue ahí: sin eso el log no sirve.
            expect(line).toContain('ana');
        });


        it('tapa el refresh token de una renovación', () => {
            expect(loggedBody({ refreshToken: 'refresh-secreto' })).not.toContain('refresh-secreto');
        });


        /**
         * El agujero que `redact` no cubría: su comodín llega a un nivel, así
         * que `body.credentials.password` se escribía en claro.
         */
        it('tapa una contraseña anidada, mire a la profundidad que mire', () => {
            const line = loggedBody({ credentials: { nested: { password: 'secreto-hondo' } } });

            expect(line).not.toContain('secreto-hondo');
        });


        it('tapa un token escrito a mano en cualquier línea', () => {
            const line = logged({ accessToken: 'token-secreto' });

            expect(line).not.toContain('token-secreto');
            expect(line).toContain('[REDACTADO]');
        });


        it('tapa también un secreto colgado de otro objeto', () => {
            expect(logged({ session: { refreshToken: 'refresh-secreto' } })).not.toContain('refresh-secreto');
        });
    });
});
