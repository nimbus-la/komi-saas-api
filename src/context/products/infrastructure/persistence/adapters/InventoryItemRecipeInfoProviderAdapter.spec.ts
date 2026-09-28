// El adapter importa el barrel de inventario, que arrastra controladores y con
// ellos @nestjs/jwt (solo ESM, rompe ts-jest).
jest.mock('@nestjs/jwt', () => ({
    JwtService: class { },
    TokenExpiredError: class extends Error { },
}));

import { InventoryItem } from '@/context/inventory/domain/inventory-item.aggregate';
import { InventoryBatchPrimitives, InventoryItemPrimitives } from '@/context/inventory/domain/types/domain.types';

import { InventoryItemRecipeInfoProviderAdapter } from './InventoryItemRecipeInfoProviderAdapter';


/**
 * Pruebas del stock por sucursal que el adapter le entrega al listado de
 * productos, armado con un agregado real de inventario.
 */

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';
const ITEM_ID = '0b6f5c8e-1d2a-4c3b-9e4f-5a6b7c8d9e0f';
const BRANCH_A = '6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b';
const BRANCH_B = '7a2d3b4c-5e6f-4a71-9b8c-0d1e2f3a4b5c';

const batch = (id: string, branchId: string, remaining: string, expirationDate: string | null = null): InventoryBatchPrimitives => ({
    id,
    branchId,
    quantityReceived: remaining,
    quantityRemaining: remaining,
    unitCostAmount: '1000',
    unitCostCurrency: 'COP',
    expirationDate,
    receivedAt: new Date('2026-01-01T00:00:00.000Z'),
});

const buildItem = (overrides: Partial<InventoryItemPrimitives> = {}): InventoryItem =>
    InventoryItem.fromPrimitives({
        id: ITEM_ID,
        tenantId: TENANT_ID,
        sku: 'INV-000001',
        name: 'Queso',
        unitOfMeasure: 'GRAM',
        isPerishable: true,
        isActive: true,
        minGlobalStock: '2',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        batches: [
            batch('1c2d3e4f-5a6b-4c7d-8e9f-0a1b2c3d4e5f', BRANCH_A, '3', '2099-12-31'),
            // Vencido: sigue con existencias en la base pero no cuenta.
            batch('2d3e4f5a-6b7c-4d8e-9f0a-1b2c3d4e5f6a', BRANCH_A, '4', '2000-01-01'),
            batch('3e4f5a6b-7c8d-4e9f-8a1b-2c3d4e5f6a7b', BRANCH_B, '10', '2099-12-31'),
        ],
        branchConfigs: [
            { id: '4f5a6b7c-8d9e-4f0a-9b2c-3d4e5f6a7b8c', branchId: BRANCH_B, minStock: '12' },
        ],
        ...overrides,
    });

const buildAdapter = (items: InventoryItem[]) => {
    const findByIds = jest.fn().mockResolvedValue(items);
    const adapter = new InventoryItemRecipeInfoProviderAdapter({ findByIds } as never);

    return { adapter, findByIds };
};


describe('InventoryItemRecipeInfoProviderAdapter', () => {
    it('no incluye el stock de sucursal cuando no se pide una', async () => {
        const { adapter } = buildAdapter([buildItem()]);

        const info = (await adapter.getMany(TENANT_ID, [ITEM_ID])).get(ITEM_ID);

        expect(info).toMatchObject({ inventoryItemId: ITEM_ID, isActive: true });
        expect(info).not.toHaveProperty('branchStock');
    });

    it('cuenta solo los lotes activos de la sucursal y usa el mínimo global', async () => {
        const { adapter } = buildAdapter([buildItem()]);

        const info = (await adapter.getMany(TENANT_ID, [ITEM_ID], BRANCH_A)).get(ITEM_ID);

        expect(Number(info?.branchStock?.currentStock)).toBe(3);
        expect(Number(info?.branchStock?.minStock)).toBe(2);
    });

    it('usa el override de mínimo de la sucursal cuando existe', async () => {
        const { adapter } = buildAdapter([buildItem()]);

        const info = (await adapter.getMany(TENANT_ID, [ITEM_ID], BRANCH_B)).get(ITEM_ID);

        expect(Number(info?.branchStock?.currentStock)).toBe(10);
        expect(Number(info?.branchStock?.minStock)).toBe(12);
    });

    it('devuelve minStock null cuando no hay política de mínimos', async () => {
        const { adapter } = buildAdapter([buildItem({ minGlobalStock: null, branchConfigs: [] })]);

        const info = (await adapter.getMany(TENANT_ID, [ITEM_ID], BRANCH_A)).get(ITEM_ID);

        expect(info?.branchStock?.minStock).toBeNull();
    });

    it('carga los items completos, sin filtrar por sucursal', async () => {
        const { adapter, findByIds } = buildAdapter([]);

        await adapter.getMany(TENANT_ID, [ITEM_ID], BRANCH_A);

        expect(findByIds).toHaveBeenCalledWith([expect.anything()], TENANT_ID);
    });
});
