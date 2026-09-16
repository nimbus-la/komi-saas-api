import { DomainEvent } from '@/shared';
import { UserAggregate } from '@/context/user/domain';

import { SEED_TENANTS } from '../../data/seed.data';
import { RunSeedUseCase } from './run-seed.use-case';


/**
 * Pruebas del seed con repositorios falsos.
 *
 * No revisan los datos uno por uno, porque cambian cada vez que alguien edita
 * seed.data.ts. Revisan lo que no debe romperse: que se borre antes de crear,
 * que la regla de rol y sucursal se cumpla y que el inventario deje bitácora.
 */

const ROLES = [
    { id: '550e8400-e29b-41d4-a716-446655440001', code: 'OWNER', name: 'Dueño', scope: 'ADMINISTRATIVE' },
    { id: '550e8400-e29b-41d4-a716-446655440002', code: 'ADMIN', name: 'Administrador', scope: 'ADMINISTRATIVE' },
    { id: '550e8400-e29b-41d4-a716-446655440003', code: 'SUPERVISOR', name: 'Supervisor', scope: 'ADMINISTRATIVE' },
    { id: '550e8400-e29b-41d4-a716-446655440005', code: 'CASHIER', name: 'Cajero', scope: 'OPERATIONAL' },
    { id: '550e8400-e29b-41d4-a716-446655440006', code: 'WAITER', name: 'Mesero', scope: 'OPERATIONAL' },
    { id: '550e8400-e29b-41d4-a716-446655440007', code: 'KITCHEN', name: 'Cocina', scope: 'OPERATIONAL' },
];


const buildHarness = () => {
    const calls: string[] = [];
    const savedUsers: UserAggregate[] = [];
    const publishedEvents: DomainEvent[] = [];
    let sequence = 0;

    const removeTenantsBySlug = jest.fn(async () => { calls.push('clean'); });
    const saveTenant = jest.fn(async () => { calls.push('tenant'); });

    const useCase = new RunSeedUseCase(
        { removeTenantsBySlug },
        { save: saveTenant } as never,
        { save: jest.fn() } as never,
        { searchAll: jest.fn().mockResolvedValue(ROLES) } as never,
        { save: jest.fn(async (user: UserAggregate) => { savedUsers.push(user); }) } as never,
        { hash: jest.fn().mockResolvedValue('$argon2id$hash-de-prueba'), verify: jest.fn() },
        { save: jest.fn(), nextSkuSequence: jest.fn(async () => ++sequence) } as never,
        { save: jest.fn() } as never,
        { save: jest.fn(), nextSkuSequence: jest.fn(async () => ++sequence) } as never,
        { publish: jest.fn(async (events: ReadonlyArray<DomainEvent>) => { publishedEvents.push(...events); }) },
    );

    return { useCase, calls, removeTenantsBySlug, savedUsers, publishedEvents };
};


describe('RunSeedUseCase', () => {
    // Sin el borrado previo, la segunda llamada chocaría con los slugs y NIT únicos.
    it('borra los negocios de prueba antes de crear el primero', async () => {
        const { useCase, calls, removeTenantsBySlug } = buildHarness();

        await useCase.execute();

        expect(calls[0]).toBe('clean');
        expect(removeTenantsBySlug).toHaveBeenCalledWith(SEED_TENANTS.map((tenant) => tenant.slug));
    });

    it('crea los cuatro negocios y uno de ellos con una sola sucursal', async () => {
        const { useCase } = buildHarness();

        const summary = await useCase.execute();

        expect(summary).toHaveLength(4);
        expect(summary.some((tenant) => tenant.branches.length === 1)).toBe(true);
    });

    // La base rechaza un administrativo con sucursal o un operativo sin ella.
    it('deja sin sucursal a los administrativos y con sucursal a los operativos', async () => {
        const { useCase, savedUsers } = buildHarness();

        await useCase.execute();

        for (const user of savedUsers) {
            const { rolScope, branchId } = user.toPrimitives();

            expect(branchId === null).toBe(rolScope === 'ADMINISTRATIVE');
        }
    });

    // Un evento por lote: es lo que usa inventory-movements para la bitácora.
    it('publica un evento de mercancía recibida por cada lote', async () => {
        const { useCase, publishedEvents } = buildHarness();

        await useCase.execute();

        const expectedBatches = SEED_TENANTS.reduce(
            (total, tenant) => total + tenant.inventory.length * tenant.branches.length,
            0,
        );

        const received = publishedEvents.filter((event) => event.eventName === 'inventory.stock.received');

        expect(received).toHaveLength(expectedBatches);
    });
});
