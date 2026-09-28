import { resolveIngredientStockStatus } from './ingredient-stock-status';


const snapshot = (currentStock: string, minStock: string | null = null, isActive = true) => ({
    isActive,
    currentStock,
    minStock,
});


describe('resolveIngredientStockStatus', () => {
    it('da OK cuando hay stock y está sobre el mínimo', () => {
        expect(resolveIngredientStockStatus(snapshot('10', '5'), '1')).toBe('OK');
    });

    it('da LOW cuando está por debajo del mínimo pero alcanza para la receta', () => {
        expect(resolveIngredientStockStatus(snapshot('4', '5'), '1')).toBe('LOW');
    });

    // "Bajo mínimo" es estricto, igual que isBelowMinimumFor del inventario.
    it('da OK cuando el stock es igual al mínimo', () => {
        expect(resolveIngredientStockStatus(snapshot('5', '5'), '1')).toBe('OK');
    });

    it('nunca da LOW si el insumo no tiene mínimo configurado', () => {
        expect(resolveIngredientStockStatus(snapshot('0.5', null), '0.2')).toBe('OK');
    });

    it('da OUT cuando no hay stock', () => {
        expect(resolveIngredientStockStatus(snapshot('0', '5'), '1')).toBe('OUT');
    });

    it('da OUT cuando el stock no alcanza para una unidad del producto', () => {
        expect(resolveIngredientStockStatus(snapshot('0.15', null), '0.2')).toBe('OUT');
    });

    it('da OUT cuando el insumo está inactivo aunque tenga stock', () => {
        expect(resolveIngredientStockStatus(snapshot('10', null, false), '1')).toBe('OUT');
    });

    it('da OUT cuando el insumo no existe o es de otro negocio', () => {
        expect(resolveIngredientStockStatus(null, '1')).toBe('OUT');
    });
});
