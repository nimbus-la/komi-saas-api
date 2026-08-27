import {
    ArgumentsHost,
    BadRequestException,
    ForbiddenException,
    HttpException,
    HttpStatus,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';

import { ApiResponse } from '@/interfaces';
import { DomainException } from '@/shared/domain/domain.exception';
import { RESPONSE_CODE, ResponseStatus } from '@/utils';

import { AllExceptionsFilter } from './all-exceptions.filter';


/** `1302` = "El nombre del item ya se encuentra registrado" (conflicto → 409). */
class ItemAlreadyExistsExceptionStub extends DomainException {
    constructor() {
        super({ code: '1302', detail: 'El item "Harina" ya existe en el tenant 42.' });
    };
};


/** Captura lo que el filtro escribe en la respuesta de Express. */
interface CapturedResponse {
    status: number | null;
    body: ApiResponse<unknown> | null;
};

/**
 * `ArgumentsHost` mínimo: solo lo que el filtro consulta. Evita levantar Nest
 * entero para verificar qué status, qué cuerpo y qué log se producen.
 */
const createHost = (request: { method?: string; originalUrl?: string; requestId?: string } | null = { method: 'POST', originalUrl: '/user' }) => {
    const captured: CapturedResponse = { status: null, body: null };

    const response = {
        status: (code: number) => {
            captured.status = code;
            return response;
        },
        json: (body: ApiResponse<unknown>) => {
            captured.body = body;
            return response;
        },
    };

    const host = {
        switchToHttp: () => ({
            getRequest: () => request ?? undefined,
            getResponse: () => response,
        }),
    } as unknown as ArgumentsHost;

    return { host, captured };
};


/**
 * Un fallo de query tal como lo envuelve TypeORM: el error crudo del driver
 * `pg` queda en `driverError`, con el SQLSTATE en `code`.
 */
const queryFailedError = (): QueryFailedError => new QueryFailedError(
    'INSERT INTO users(email) VALUES ($1)',
    ['ana@komi.com'],
    Object.assign(new Error('duplicate key value violates unique constraint'), {
        name: 'DatabaseError',
        severity: 'ERROR',
        code: '23505',
        table: 'users',
        constraint: 'uq_users_email',
        detail: 'Key (email)=(ana@komi.com) already exists.',
    }),
);


const nodeSystemError = (): Error => Object.assign(
    new Error('connect ECONNREFUSED 127.0.0.1:5432'),
    { code: 'ECONNREFUSED', syscall: 'connect', address: '127.0.0.1', port: 5432 },
);



describe('AllExceptionsFilter', () => {
    let filter: AllExceptionsFilter;
    let warn: jest.SpyInstance;
    let error: jest.SpyInstance;

    /** Todo lo que el logger de errores recibió, concatenado. */
    const loggedError = (): string => error.mock.calls.map((call) => String(call[0])).join('\n');

    beforeEach(() => {
        filter = new AllExceptionsFilter();
        warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
        error = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });


    describe('intercepta cualquier excepción, venga de donde venga', () => {
        it.each([
            ['TypeORM · QueryFailedError', queryFailedError()],
            ['TypeORM · EntityNotFoundError', new EntityNotFoundError('UserEntity', { id: 'abc' })],
            ['Node · ECONNREFUSED', nodeSystemError()],
            ['JavaScript · TypeError', new TypeError("Cannot read properties of undefined (reading 'id')")],
            ['lanzaron un string', 'me lanzaron un string'],
            ['lanzaron null', null],
        ])('%s → 500 genérico para el cliente', (_caso, exception) => {
            const { host, captured } = createHost();

            filter.catch(exception, host);

            expect(captured.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
            expect(captured.body).toMatchObject({
                status: ResponseStatus.Error,
                code: RESPONSE_CODE.INTERNAL_ERROR,
                message: 'Ocurrió un error inesperado. Intente más tarde.',
                content: null,
            });
        });

        it('una excepción de dominio conserva su código y su estado del catálogo', () => {
            const { host, captured } = createHost();

            filter.catch(new ItemAlreadyExistsExceptionStub(), host);

            expect(captured.status).toBe(HttpStatus.CONFLICT);
            expect(captured.body).toMatchObject({ code: '1302', message: 'El nombre del item ya se encuentra registrado.' });
        });

        it('una HttpException conserva el estado que Nest ya resolvió', () => {
            const { host, captured } = createHost();

            filter.catch(new ForbiddenException(), host);

            expect(captured.status).toBe(HttpStatus.FORBIDDEN);
            expect(captured.body?.code).toBe(RESPONSE_CODE.VALIDATION_ERROR);
        });
    });


    describe('excepciones de Nest: un 4xx no es lo mismo que un 5xx', () => {
        it.each([
            ['BadRequestException', new BadRequestException(['email must be an email'])],
            ['ForbiddenException', new ForbiddenException()],
            ['NotFoundException', new NotFoundException()],
        ])('%s es un rechazo deliberado: basta una línea de warn', (_caso, exception) => {
            const { host } = createHost();

            filter.catch(exception, host);

            expect(warn).toHaveBeenCalledTimes(1);
            expect(error).not.toHaveBeenCalled();
        });

        it('un 4xx registra el payload que armó Nest', () => {
            const { host } = createHost();

            filter.catch(new BadRequestException(['email must be an email']), host);

            expect(warn).toHaveBeenCalledWith(expect.stringContaining('email must be an email'));
        });

        it('InternalServerErrorException se vuelca completo, con stack', () => {
            const { host } = createHost();

            filter.catch(new InternalServerErrorException('fallo al generar el SKU'), host);

            const log = loggedError();

            expect(warn).not.toHaveBeenCalled();
            expect(log).toContain('InternalServerErrorException');
            expect(log).toContain('fallo al generar el SKU');
            expect(log).toContain('all-exceptions.filter.spec.ts');
        });

        it('cualquier 5xx del framework se vuelca igual que un error ajeno', () => {
            const { host } = createHost();

            filter.catch(new HttpException('el gateway no respondió', HttpStatus.BAD_GATEWAY), host);

            expect(loggedError()).toMatch(/\n\s+at /);
        });

        it('el 5xx del framework conserva su propio estado en la respuesta', () => {
            const { host, captured } = createHost();

            filter.catch(new HttpException('boom', HttpStatus.BAD_GATEWAY), host);

            expect(captured.status).toBe(HttpStatus.BAD_GATEWAY);
            expect(captured.body?.traceId).toMatch(/^[0-9a-f]{12}$/);
        });
    });


    describe('el error completo queda en la consola', () => {
        it('vuelca la query, los parámetros y el driverError de TypeORM', () => {
            const { host } = createHost();

            filter.catch(queryFailedError(), host);

            const log = loggedError();

            expect(log).toContain('QueryFailedError');
            expect(log).toContain('INSERT INTO users(email) VALUES ($1)');
            expect(log).toContain('ana@komi.com');
            expect(log).toContain('23505');
            expect(log).toContain('uq_users_email');
            expect(log).toContain('table');
        });

        it('vuelca el código y el destino de un error de red de Node', () => {
            const { host } = createHost();

            filter.catch(nodeSystemError(), host);

            const log = loggedError();

            expect(log).toContain('ECONNREFUSED');
            expect(log).toContain('connect');
            expect(log).toContain('127.0.0.1');
            expect(log).toContain('5432');
        });

        it('vuelca el stack de un bug de JavaScript', () => {
            const { host } = createHost();

            filter.catch(new TypeError('undefined no tiene id'), host);

            const log = loggedError();

            expect(log).toContain('TypeError: undefined no tiene id');
            expect(log).toContain('all-exceptions.filter.spec.ts');
        });

        it('registra el método y la ruta para poder reproducir la petición', () => {
            const { host } = createHost({ method: 'PATCH', originalUrl: '/user/42/status' });

            filter.catch(new TypeError('boom'), host);

            expect(loggedError()).toContain('PATCH /user/42/status');
        });

        it('no se rompe volcando algo que no es un Error', () => {
            const { host } = createHost();

            filter.catch({ motivo: 'raro', anidado: { nivel: 2 } }, host);

            expect(loggedError()).toContain('raro');
        });
    });


    describe('traceId', () => {
        it('reutiliza el identificador que puso requestIdMiddleware', () => {
            const { host, captured } = createHost({ method: 'POST', originalUrl: '/user', requestId: 'front-abc123' });

            filter.catch(new TypeError('boom'), host);

            // El mismo que ya viajó en el header X-Request-Id al entrar.
            expect(captured.body?.traceId).toBe('front-abc123');
            expect(loggedError()).toContain('front-abc123');
        });

        it('genera uno propio si el filtro se usa sin el middleware delante', () => {
            const { host, captured } = createHost({ method: 'POST', originalUrl: '/user' });

            filter.catch(new TypeError('boom'), host);

            expect(captured.body?.traceId).toMatch(/^[0-9a-f]{12}$/);
        });

        it('acompaña a toda respuesta de error', () => {
            const { host, captured } = createHost();

            filter.catch(new TypeError('boom'), host);

            expect(captured.body?.traceId).toMatch(/^[0-9a-f]{12}$/);
        });

        it('cambia en cada petición', () => {
            const primera = createHost();
            const segunda = createHost();

            filter.catch(new TypeError('boom'), primera.host);
            filter.catch(new TypeError('boom'), segunda.host);

            expect(primera.captured.body?.traceId).not.toBe(segunda.captured.body?.traceId);
        });

        it('es el mismo que quedó en la consola, para poder cruzarlos', () => {
            const { host, captured } = createHost();

            filter.catch(queryFailedError(), host);

            expect(loggedError()).toContain(captured.body?.traceId ?? 'sin-trace');
        });

        it('también acompaña a los errores de dominio, que se loguean como warn', () => {
            const { host, captured } = createHost();

            filter.catch(new ItemAlreadyExistsExceptionStub(), host);

            expect(warn).toHaveBeenCalledWith(expect.stringContaining(captured.body?.traceId ?? 'sin-trace'));
        });
    });


    describe('lo que NO sale por la respuesta', () => {
        it('nada de la base de datos llega al cliente', () => {
            const { host, captured } = createHost();

            filter.catch(queryFailedError(), host);

            const serializado = JSON.stringify(captured.body);

            expect(serializado).not.toContain('INSERT INTO');
            expect(serializado).not.toContain('uq_users_email');
            expect(serializado).not.toContain('23505');
            expect(serializado).not.toContain('ana@komi.com');
        });

        it('el detalle de una regla de negocio se queda en el log', () => {
            const { host, captured } = createHost();

            filter.catch(new ItemAlreadyExistsExceptionStub(), host);

            expect(JSON.stringify(captured.body)).not.toContain('Harina');
            expect(warn).toHaveBeenCalledWith(expect.stringContaining('Harina'));
        });

        it('el sobre siempre tiene la misma forma', () => {
            const { host, captured } = createHost();

            filter.catch(new TypeError('boom'), host);

            expect(Object.keys(captured.body ?? {}).sort()).toEqual(
                ['code', 'content', 'httpStatus', 'message', 'status', 'traceId'],
            );
        });
    });


    it('responde aunque la request no esté disponible', () => {
        const { host, captured } = createHost(null);

        filter.catch(new TypeError('boom'), host);

        expect(captured.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(loggedError()).toContain('petición no disponible');
    });
});
