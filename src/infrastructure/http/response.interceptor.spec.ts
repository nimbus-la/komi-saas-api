import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { firstValueFrom, of } from 'rxjs';

import { ApiResponse } from '@/interfaces';
import { RESPONSE_CODE, ResponseStatus } from '@/utils';

import { ResponseInterceptor } from './response.interceptor';


/**
 * `ExecutionContext` mínimo: solo el estado de la respuesta y el identificador
 * que dejó `requestIdMiddleware` en la petición.
 */
const createContext = (statusCode: number, requestId: string | undefined): ExecutionContext => ({
    switchToHttp: () => ({
        getResponse: () => ({ statusCode }),
        getRequest: () => (requestId === undefined ? {} : { requestId }),
    }),
    getHandler: () => () => undefined,
}) as unknown as ExecutionContext;


const createHandler = <T>(data: T): CallHandler<T> => ({ handle: () => of(data) });


/** Con el mensaje del decorador o sin él, según lo que devuelva el Reflector. */
const createInterceptor = (message?: string): ResponseInterceptor<unknown> =>
    new ResponseInterceptor({ get: () => message } as unknown as Reflector);


const intercept = async <T>(
    data: T,
    options: { statusCode?: number; requestId?: string | undefined; message?: string } = {}
): Promise<ApiResponse<unknown>> => firstValueFrom(
    createInterceptor(options.message).intercept(
        createContext(options.statusCode ?? 200, 'requestId' in options ? options.requestId : 'abc123def456'),
        createHandler(data)
    )
);



describe('ResponseInterceptor', () => {
    describe('traceId', () => {
        /**
         * La razón de llevarlo también en las exitosas: si el front guarda el
         * traceId de TODA respuesta, un "esto se guardó mal" que no produjo
         * ningún error sigue teniendo por dónde buscarse en el log.
         */
        it('acompaña a una respuesta exitosa', async () => {
            const response = await intercept({ id: 42 });

            expect(response.traceId).toBe('abc123def456');
        });


        it('acompaña también a la respuesta sin resultados', async () => {
            const response = await intercept([]);

            expect(response.code).toBe(RESPONSE_CODE.NO_CONTENT);
            expect(response.traceId).toBe('abc123def456');
        });


        /** Sin el middleware delante no hay identificador: la clave no se inventa. */
        it('no aparece si la petición no trae ninguno', async () => {
            const response = await intercept({ id: 42 }, { requestId: undefined });

            expect('traceId' in response).toBe(false);
        });
    });


    describe('el sobre de siempre', () => {
        it('un resultado con datos es SUCCESS, con el mensaje del decorador', async () => {
            const response = await intercept({ id: 42 }, { statusCode: 201, message: 'Item creado.' });

            expect(response).toEqual({
                status: ResponseStatus.Success,
                code: RESPONSE_CODE.SUCCESS,
                httpStatus: 201,
                message: 'Item creado.',
                content: { id: 42 },
                traceId: 'abc123def456',
            });
        });


        it('un listado vacío es INFO, no un error', async () => {
            const response = await intercept([]);

            expect(response).toMatchObject({
                status: ResponseStatus.Info,
                message: 'No se encontraron resultados.',
                content: null,
            });
        });


        it('un paginado sin filas también es INFO', async () => {
            const response = await intercept({ rows: [], pageNumber: 1, pageSize: 20, total: 0 });

            expect(response.status).toBe(ResponseStatus.Info);
            expect(response.content).toBeNull();
        });
    });
});
