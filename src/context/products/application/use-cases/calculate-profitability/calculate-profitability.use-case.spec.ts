import {
    IngredientWithoutCostException,
    TenantNotFoundException,
} from '@/context/products/domain/exceptions/product-exception';
import { DuplicateIngredientException } from '@/context/products/domain/recipe/exceptions/duplicate-ingredient.exception';
import { InventoryItemNotValidForTenantException } from '@/context/products/domain/recipe/exceptions/inventory-item-not-valid-for-tenant.exception';
import { TenantChecker } from '../../ports/tenant-checker';
import {
    InventoryItemRecipeInfo,
    InventoryItemRecipeInfoProvider,
} from '../../ports/inventory-item-recipe-info.provider';

import { CalculateProfitabilityUseCase } from './calculate-profitability.use-case';

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';

const item = (inventoryItemId: string, unitCostAmount: string | null): InventoryItemRecipeInfo => ({
    inventoryItemId,
    name: inventoryItemId,
    unitOfMeasure: 'g',
    unitCostAmount,
    currentStock: '1000',
    isActive: true,
});

/** Arma el caso de uso con un inventario en memoria. */
const build = (items: InventoryItemRecipeInfo[], tenantExists = true) => {
    const tenantChecker: TenantChecker = { exists: jest.fn().mockResolvedValue(tenantExists) };
    const recipeInfoProvider: InventoryItemRecipeInfoProvider = {
        getMany: jest.fn().mockResolvedValue(new Map(items.map((i) => [i.inventoryItemId, i]))),
    };

    return new CalculateProfitabilityUseCase(tenantChecker, recipeInfoProvider);
};

describe('CalculateProfitabilityUseCase', () => {

    it('suma el costo de cada línea y calcula el precio para el margen', async () => {
        const useCase = build([item('carne', '20'), item('pan', '500')]);

        const result = await useCase.execute({
            tenantId: TENANT_ID,
            receta: [
                { inventoryItemId: 'carne', quantity: '150' },
                { inventoryItemId: 'pan', quantity: '2' },
            ],
            margenObjetivo: '60',
        });

        expect(result.costoReceta).toBe('4000.00');
        expect(result.precioVenta).toBe('10000.00');
    });

    it('falla si el negocio no existe', async () => {
        const useCase = build([item('carne', '20')], false);

        await expect(useCase.execute({
            tenantId: TENANT_ID,
            receta: [{ inventoryItemId: 'carne', quantity: '1' }],
        })).rejects.toThrow(TenantNotFoundException);
    });

    it('falla si un insumo no es del negocio', async () => {
        const useCase = build([]);

        await expect(useCase.execute({
            tenantId: TENANT_ID,
            receta: [{ inventoryItemId: 'carne', quantity: '1' }],
        })).rejects.toThrow(InventoryItemNotValidForTenantException);
    });

    it('falla si un insumo no tiene costo', async () => {
        const useCase = build([item('carne', null)]);

        await expect(useCase.execute({
            tenantId: TENANT_ID,
            receta: [{ inventoryItemId: 'carne', quantity: '1' }],
        })).rejects.toThrow(IngredientWithoutCostException);
    });

    it('falla si un insumo viene repetido', async () => {
        const useCase = build([item('carne', '20')]);

        await expect(useCase.execute({
            tenantId: TENANT_ID,
            receta: [
                { inventoryItemId: 'carne', quantity: '1' },
                { inventoryItemId: 'carne', quantity: '2' },
            ],
        })).rejects.toThrow(DuplicateIngredientException);
    });
});
