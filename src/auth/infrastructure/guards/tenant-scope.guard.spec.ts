import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { CrossTenantAccessException } from '../../domain';
import { TenantScopeGuard } from './tenant-scope.guard';


/**
 * Pruebas del guard que impide operar sobre un negocio ajeno.
 *
 * Es la red que tapa el agujero mientras los controladores siguen recibiendo el
 * tenantId por la petición. Casi todos los tests son de la forma "esto NO debe
 * pasar": lo valioso aquí no es que deje trabajar, sino que no deje colarse.
 */

const MI_TENANT = '11111111-1111-4111-8111-111111111111';
const OTRO_TENANT = '22222222-2222-4222-8222-222222222222';


/** Petición mínima con lo que el guard mira. */
const buildContext = (
    request: Record<string, unknown>,
): ExecutionContext => ({
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => undefined,
    getClass: () => undefined,
} as unknown as ExecutionContext);


/** El guard con el reflector devolviendo si la ruta es pública o no. */
const buildGuard = (isPublic = false): TenantScopeGuard => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(isPublic) };

    return new TenantScopeGuard(reflector as unknown as Reflector);
};


/** Usuario ya autenticado, tal como lo deja el guard de JWT. */
const user = {
    userId: '33333333-3333-4333-8333-333333333333',
    tenantId: MI_TENANT,
    branchId: null,
    rolScope: 'ADMINISTRATIVE',
    sessionId: '44444444-4444-4444-8444-444444444444',
};


/** Corre el guard sobre una petición autenticada con las fuentes indicadas. */
const run = (sources: { params?: unknown; query?: unknown; body?: unknown }): boolean =>
    buildGuard().canActivate(buildContext({ user, ...sources }));


describe('TenantScopeGuard', () => {
    /**
     * El tenantId llega por tres sitios distintos según el endpoint. Da igual por
     * cuál venga: si no es el del token, se corta.
     */
    describe('negocio ajeno', () => {
        it.each(['params', 'query', 'body'])('corta cuando viene por %s', (source) => {
            expect(() => run({ [source]: { tenantId: OTRO_TENANT } }))
                .toThrow(CrossTenantAccessException);
        });


        // Con que uno se cuele anidado, un chequeo solo del primer nivel no serviría
        // de nada.
        it('corta cuando viene anidado dentro del body', () => {
            expect(() => run({ body: { config: { sucursales: [{ tenantId: OTRO_TENANT }] } } }))
                .toThrow(CrossTenantAccessException);
        });


        // El primero coincide y podría dar una falsa sensación de que ya está todo
        // revisado. Hay que mirarlos todos.
        it('corta aunque el ajeno llegue después de uno válido', () => {
            expect(() => run({
                params: { tenantId: MI_TENANT },
                body: { tenantId: OTRO_TENANT },
            })).toThrow(CrossTenantAccessException);
        });


        it('deja los dos identificadores en el detalle, para el log', () => {
            try {
                run({ query: { tenantId: OTRO_TENANT } });
                fail('debió lanzar');
            } catch (error) {
                expect((error as CrossTenantAccessException).code).toBe('1107');
                expect((error as CrossTenantAccessException).detail).toContain(MI_TENANT);
                expect((error as CrossTenantAccessException).detail).toContain(OTRO_TENANT);
            }
        });
    });


    /** Lo que sí tiene que seguir pasando, para no romper la aplicación entera. */
    describe('peticiones legítimas', () => {
        it.each(['params', 'query', 'body'])('deja pasar el propio tenantId por %s', (source) => {
            expect(run({ [source]: { tenantId: MI_TENANT } })).toBe(true);
        });


        // Endpoints como /rol no mencionan negocio alguno. No hay nada que comparar
        // y no es motivo para cortarlos.
        it('deja pasar cuando la petición no menciona ningún negocio', () => {
            expect(run({ params: {}, query: { pageNumber: '1' }, body: { name: 'X' } })).toBe(true);
        });


        it('no se cae con body nulo ni con fuentes ausentes', () => {
            expect(run({ body: null })).toBe(true);
            expect(run({})).toBe(true);
        });


        // Un tenantId que no sea texto es un payload inválido: eso lo rechaza el
        // ValidationPipe después, no este guard.
        it('ignora un tenantId que no sea texto', () => {
            expect(run({ body: { tenantId: 12345 } })).toBe(true);
        });
    });


    /**
     * El guard corre para toda la aplicación, así que tiene que convivir con las
     * rutas que no llevan token.
     */
    describe('rutas sin usuario', () => {
        it('deja pasar las rutas públicas', () => {
            const guard = buildGuard(true);

            expect(guard.canActivate(buildContext({ body: { tenantId: OTRO_TENANT } }))).toBe(true);
        });


        // Si la ruta no es pública y no hay usuario, el guard de JWT ya la frenó
        // antes; aquí no hay con qué comparar y no se inventa un rechazo.
        it('deja pasar cuando no hay usuario en la petición', () => {
            const guard = buildGuard();

            expect(guard.canActivate(buildContext({ body: { tenantId: OTRO_TENANT } }))).toBe(true);
        });
    });
});
