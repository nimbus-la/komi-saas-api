import { buildProductStockAlert, IngredientStockEvaluation } from './product-stock-alert';


const BRANCH_ID = '6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b';

const evaluation = (
    inventoryItemId: string,
    status: IngredientStockEvaluation['status'],
    isOptional = false,
): IngredientStockEvaluation => ({
    inventoryItemId,
    name: inventoryItemId,
    status,
    isOptional,
    currentStock: '0',
    minStock: null,
    requiredQuantity: '1',
    branchId: BRANCH_ID,
});


describe('buildProductStockAlert', () => {
    it('devuelve null cuando todos los insumos están bien', () => {
        expect(buildProductStockAlert([evaluation('pan', 'OK'), evaluation('carne', 'OK')])).toBeNull();
    });

    it('devuelve null cuando el producto no tiene receta', () => {
        expect(buildProductStockAlert([])).toBeNull();
    });

    it('da WARNING cuando algún insumo está bajo mínimo', () => {
        const alert = buildProductStockAlert([evaluation('pan', 'OK'), evaluation('carne', 'LOW')]);

        expect(alert?.level).toBe('WARNING');
        expect(alert?.items.map((item) => item.inventoryItemId)).toEqual(['carne']);
    });

    it('da ERROR cuando un insumo obligatorio está agotado', () => {
        const alert = buildProductStockAlert([evaluation('pan', 'LOW'), evaluation('carne', 'OUT')]);

        expect(alert?.level).toBe('ERROR');
        expect(alert?.items.map((item) => item.status)).toEqual(['LOW', 'OUT']);
    });

    // Sin el opcional el producto se sigue pudiendo preparar.
    it('da WARNING cuando el único agotado es opcional', () => {
        const alert = buildProductStockAlert([evaluation('pan', 'OK'), evaluation('queso', 'OUT', true)]);

        expect(alert?.level).toBe('WARNING');
        expect(alert?.items).toEqual([expect.objectContaining({ inventoryItemId: 'queso', status: 'OUT', isOptional: true })]);
    });
});
