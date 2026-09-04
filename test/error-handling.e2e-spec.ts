import { Controller, ForbiddenException, Get, INestApplication } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { LoggerModule } from 'nestjs-pino';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import request from 'supertest';

import { AllExceptionsFilter } from '@/infrastructure/http/all-exceptions.filter';
import { buildLoggerParams } from '@/infrastructure/logging/logger.config';
import { ResponseInterceptor } from '@/infrastructure/http/response.interceptor';
import { DomainException } from '@/shared/domain/domain.exception';
import { RESPONSE_CODE } from '@/utils';


/** `1302` = "El nombre del item ya se encuentra registrado". */
class ItemAlreadyExistsException extends DomainException {
    constructor(name: string) {
        super({ code: '1302', detail: `El item "${name}" ya existe en el tenant 42.` });
    };
};


const queryFailedError = (): QueryFailedError => new QueryFailedError(
    'INSERT INTO inventory_items(name) VALUES ($1)',
    ['Harina'],
    Object.assign(new Error('duplicate key value violates unique constraint'), {
        name: 'DatabaseError',
        severity: 'ERROR',
        code: '23505',
        table: 'inventory_items',
        constraint: 'uq_inventory_items_name',
        detail: 'Key (name)=(Harina) already exists.',
    }),
);

const nodeSystemError = (): Error => Object.assign(
    new Error('connect ECONNREFUSED 127.0.0.1:5432'),
    { code: 'ECONNREFUSED', syscall: 'connect', address: '127.0.0.1', port: 5432 },
);


/**
 * Controlador de laboratorio: cada ruta lanza una de las tecnologías que el
 * filtro tiene que interceptar. No toca la base de datos: reproduce el error
 * tal como llegaría desde TypeORM o desde el runtime de Node.
 */
@Controller('lab')
class LabController {

    @Get('ok')
    ok(): { id: string } {
        return { id: 'itm-1' };
    };

    @Get('pagina-vacia')
    paginaVacia(): { rows: unknown[]; pageNumber: number; pageSize: number; total: number } {
        return { rows: [], pageNumber: 3, pageSize: 10, total: 0 };
    };

    @Get('dominio')
    dominio(): never {
        throw new ItemAlreadyExistsException('Harina');
    };

    @Get('typeorm-query')
    typeormQuery(): never {
        throw queryFailedError();
    };

    @Get('typeorm-entidad')
    typeormEntidad(): never {
        throw new EntityNotFoundError('UserEntity', { id: 'abc' });
    };

    @Get('red')
    red(): never {
        throw nodeSystemError();
    };

    @Get('nest')
    nest(): never {
        throw new ForbiddenException();
    };

    @Get('bug')
    bug(): never {
        throw new TypeError("Cannot read properties of undefined (reading 'id')");
    };
};



describe('Manejo de errores (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        // El mismo cableado que en AppModule. El logger va en silencio para no
        // llenar la salida de jest, pero su middleware sigue montado y es el que
        // genera el identificador de cada peticion.
        const moduleRef = await Test.createTestingModule({
            imports: [
                LoggerModule.forRoot(
                    buildLoggerParams({ level: 'silent', pretty: false, logRequestPayload: false })
                ),
            ],
            controllers: [LabController],
            providers: [
                { provide: APP_FILTER, useClass: AllExceptionsFilter },
                { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
            ],
        }).compile();

        app = moduleRef.createNestApplication();

        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });


    const get = (ruta: string) => request(app.getHttpServer()).get(`/lab/${ruta}`);


    describe('camino feliz (no se rompió nada)', () => {
        it('responde 200 con el contenido en `content`', async () => {
            const { status, body } = await get('ok');

            expect(status).toBe(200);
            expect(body).toMatchObject({ status: 'SUCCESS', code: RESPONSE_CODE.SUCCESS, content: { id: 'itm-1' } });
        });

        it('anula el contenido de una página sin resultados', async () => {
            const { status, body } = await get('pagina-vacia');

            expect(status).toBe(200);
            expect(body).toMatchObject({ status: 'INFO', code: RESPONSE_CODE.NO_CONTENT, content: null });
        });

        /**
         * El traceId va tambien en las exitosas. Si el front lo guarda siempre,
         * un "esto se guardo mal" que no produjo ningun error sigue teniendo
         * por donde buscarse.
         */
        it('agrega el traceId al cuerpo, y es el mismo del header', async () => {
            const { body, headers } = await get('ok');

            expect(body.traceId).toBe(headers['x-request-id']);
        });
    });


    describe('X-Request-Id: el identificador existe desde que entra la petición', () => {
        it('viaja como header también cuando todo salió bien', async () => {
            const { status, headers } = await get('ok');

            expect(status).toBe(200);
            expect(headers['x-request-id']).toMatch(/^[0-9a-f]{12}$/);
        });

        it('el header y el traceId del cuerpo son el mismo identificador', async () => {
            const { headers, body } = await get('bug');

            expect(headers['x-request-id']).toBe(body.traceId);
        });

        it('respeta el identificador que mandó el front', async () => {
            const { headers, body } = await get('bug').set('X-Request-Id', 'front-abc123');

            expect(headers['x-request-id']).toBe('front-abc123');
            expect(body.traceId).toBe('front-abc123');
        });

        it('descarta el identificador que no supera la validación', async () => {
            const { headers, body } = await get('bug').set('X-Request-Id', 'aaa] [1302] GET /admin');

            expect(headers['x-request-id']).toMatch(/^[0-9a-f]{12}$/);
            expect(body.traceId).toBe(headers['x-request-id']);
        });

        it('da un identificador distinto a cada petición', async () => {
            const primera = await get('ok');
            const segunda = await get('ok');

            expect(primera.headers['x-request-id']).not.toBe(segunda.headers['x-request-id']);
        });
    });


    describe('el filtro intercepta todas las tecnologías, no solo el dominio', () => {
        it.each(['typeorm-query', 'typeorm-entidad', 'red', 'bug'])(
            'GET /lab/%s → 500 con el mensaje genérico',
            async (ruta) => {
                const { status, body } = await get(ruta);

                expect(status).toBe(500);
                expect(body).toMatchObject({
                    status: 'ERROR',
                    code: RESPONSE_CODE.INTERNAL_ERROR,
                    message: 'Ocurrió un error inesperado. Intente más tarde.',
                    content: null,
                });
            },
        );

        it('una regla de negocio conserva su código y su estado', async () => {
            const { status, body } = await get('dominio');

            expect(status).toBe(409);
            expect(body).toMatchObject({ code: '1302', message: 'El nombre del item ya se encuentra registrado.' });
        });

        it('una excepción de Nest conserva el estado que ya resolvió', async () => {
            const { status } = await get('nest');

            expect(status).toBe(403);
        });

        it('toda respuesta de error trae traceId', async () => {
            for (const ruta of ['dominio', 'typeorm-query', 'red', 'nest', 'bug']) {
                const { body } = await get(ruta);

                expect(body.traceId).toMatch(/^[0-9a-f]{12}$/);
            };
        });
    });


    describe('lo que NO debe salir por la respuesta', () => {
        it('no filtra SQL, tablas, restricciones ni SQLSTATE', async () => {
            const { text } = await get('typeorm-query');

            expect(text).not.toMatch(/INSERT|SELECT|DELETE/);
            expect(text).not.toContain('23505');
            expect(text).not.toContain('inventory_items');
            expect(text).not.toContain('uq_inventory_items_name');
        });

        it('no filtra el host ni el puerto de la base de datos', async () => {
            const { text } = await get('red');

            expect(text).not.toContain('127.0.0.1');
            expect(text).not.toContain('5432');
        });

        it('no filtra el stack ni el mensaje original de un bug', async () => {
            const { text } = await get('bug');

            expect(text).not.toContain('Cannot read properties');
            expect(text).not.toContain('at LabController');
        });

        it('no filtra el detalle de una regla de negocio', async () => {
            const { text } = await get('dominio');

            expect(text).not.toContain('Harina');
            expect(text).not.toContain('tenant 42');
        });
    });
});
