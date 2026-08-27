import { NextFunction, Request, Response } from 'express';

import {
    createRequestId,
    REQUEST_ID_HEADER,
    requestIdMiddleware,
    RequestWithId,
    resolveRequestId,
} from './request-id.middleware';


/** Petición y respuesta mínimas: solo lo que el middleware toca. */
const createExchange = (incoming?: unknown) => {
    const headers: Record<string, unknown> = {};

    if (incoming !== undefined) {
        headers['x-request-id'] = incoming;
    };

    const setHeaders: Record<string, string> = {};

    const req = { headers } as unknown as RequestWithId;
    const res = { setHeader: (name: string, value: string) => { setHeaders[name] = value; } } as unknown as Response;

    let llamadasANext = 0;
    const next: NextFunction = () => { llamadasANext += 1; };

    return {
        req,
        res,
        next,
        setHeaders,
        get llamadasANext() { return llamadasANext; },
    };
};



describe('resolveRequestId', () => {

    describe('acepta el identificador del cliente cuando es utilizable', () => {
        it.each([
            ['hexadecimal', 'dd60de2d61ba'],
            ['un uuid', '3f2504e0-4f89-11d3-9a0c-0305e82c3301'],
            ['alfanumérico con guiones', 'front-abc123'],
            ['el mínimo de 8 caracteres', 'abcd1234'],
            ['el máximo de 64 caracteres', 'a'.repeat(64)],
        ])('%s', (_caso, entrada) => {
            expect(resolveRequestId(entrada)).toBe(entrada);
        });
    });


    describe('lo descarta y genera uno propio cuando no lo es', () => {
        it.each([
            ['no viene', undefined],
            ['viene vacío', ''],
            ['es demasiado corto', 'abc'],
            ['excede los 64 caracteres', 'a'.repeat(65)],
            ['trae espacios', 'abc def123'],
            // Node ya rechaza en el parser los saltos de línea dentro de un
            // header; esto cubre el caso por si el valor llega por otra vía.
            ['imita una línea de log', 'aaa] [1302] GET /admin'],
            ['trae un salto de línea', 'abc\n[Nest] ERROR linea falsa'],
            ['trae escapes ANSI', '[2J[31mFALSO'],
            ['parece un correo', 'ana@komi.com'],
            ['llega repetido como arreglo', ['abcd1234', 'otro5678']],
            ['no es un string', 12345678],
            ['es null', null],
        ])('%s', (_caso, entrada) => {
            const resultado = resolveRequestId(entrada);

            expect(resultado).not.toBe(entrada);
            expect(resultado).toMatch(/^[0-9a-f]{12}$/);
        });
    });
});


describe('createRequestId', () => {
    it('genera 12 caracteres hexadecimales', () => {
        expect(createRequestId()).toMatch(/^[0-9a-f]{12}$/);
    });

    it('no se repite entre llamadas', () => {
        const generados = new Set(Array.from({ length: 500 }, createRequestId));

        expect(generados.size).toBe(500);
    });
});


describe('requestIdMiddleware', () => {

    it('deja el identificador en la petición y en el header de respuesta', () => {
        const { req, res, next, setHeaders } = createExchange();

        requestIdMiddleware(req as Request, res, next);

        expect(req.requestId).toMatch(/^[0-9a-f]{12}$/);
        expect(setHeaders[REQUEST_ID_HEADER]).toBe(req.requestId);
    });

    it('respeta el identificador válido que mandó el front', () => {
        const { req, res, next, setHeaders } = createExchange('front-abc123');

        requestIdMiddleware(req as Request, res, next);

        expect(req.requestId).toBe('front-abc123');
        expect(setHeaders[REQUEST_ID_HEADER]).toBe('front-abc123');
    });

    it('sustituye el identificador que no supera la validación', () => {
        const { req, res, next, setHeaders } = createExchange('aaa] [1302] GET /admin');

        requestIdMiddleware(req as Request, res, next);

        expect(req.requestId).toMatch(/^[0-9a-f]{12}$/);
        expect(setHeaders[REQUEST_ID_HEADER]).toBe(req.requestId);
    });

    it('siempre cede el paso al siguiente middleware', () => {
        const valido = createExchange('front-abc123');
        const invalido = createExchange('!!!');

        requestIdMiddleware(valido.req as Request, valido.res, valido.next);
        requestIdMiddleware(invalido.req as Request, invalido.res, invalido.next);

        expect(valido.llamadasANext).toBe(1);
        expect(invalido.llamadasANext).toBe(1);
    });

    it('da un identificador distinto a cada petición sin header', () => {
        const primera = createExchange();
        const segunda = createExchange();

        requestIdMiddleware(primera.req as Request, primera.res, primera.next);
        requestIdMiddleware(segunda.req as Request, segunda.res, segunda.next);

        expect(primera.req.requestId).not.toBe(segunda.req.requestId);
    });
});
