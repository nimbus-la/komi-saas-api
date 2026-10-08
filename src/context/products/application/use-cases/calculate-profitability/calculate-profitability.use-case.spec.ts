import { BasePriceError } from '@/shared';

import { TenantNotFoundException } from '@/context/products/domain/exceptions/product-exception';
import { TenantChecker } from '../../ports/tenant-checker';

import { CalculateProfitabilityUseCase } from './calculate-profitability.use-case';

// Recetas: desconectado en esta versión. El costo salía de los insumos de la
// receta y se probaba que fallara con un insumo ajeno, sin costo o repetido.
// import { IngredientWithoutCostException } from '@/context/products/domain/exceptions/product-exception';
// import { DuplicateIngredientException } from '@/context/products/domain/recipe/exceptions/duplicate-ingredient.exception';
// import { InventoryItemNotValidForTenantException } from '@/context/products/domain/recipe/exceptions/inventory-item-not-valid-for-tenant.exception';

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';

const build = (tenantExists = true) => {
    const tenantChecker: TenantChecker = { exists: jest.fn().mockResolvedValue(tenantExists) };

    return new CalculateProfitabilityUseCase(tenantChecker);
};

describe('CalculateProfitabilityUseCase', () => {

    it('calcula el precio para el margen a partir del costo', async () => {
        const result = await build().execute({
            tenantId: TENANT_ID,
            cost: '4000',
            targetMargin: '60',
        });

        expect(result.cost).toBe('4000.00');
        expect(result.price).toBe('10000.00');
    });

    it('calcula el margen real a partir del costo y el precio', async () => {
        const result = await build().execute({
            tenantId: TENANT_ID,
            cost: '4000',
            price: '10000',
        });

        expect(result.margin).toBe('60.00');
    });

    it('falla si el negocio no existe', async () => {
        await expect(build(false).execute({
            tenantId: TENANT_ID,
            cost: '4000',
        })).rejects.toThrow(TenantNotFoundException);
    });

    it('rechaza un costo negativo', async () => {
        await expect(build().execute({
            tenantId: TENANT_ID,
            cost: '-100',
        })).rejects.toThrow(BasePriceError);
    });
});
