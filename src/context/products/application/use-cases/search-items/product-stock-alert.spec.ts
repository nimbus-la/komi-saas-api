import { buildProductStockAlert, IngredientStockEvaluation } from './product-stock-alert';


const evaluation = (
    status: IngredientStockEvaluation['status'],
    isOptional = false,
): IngredientStockEvaluation => ({ status, isOptional });


describe('buildProductStockAlert', () => {
    it('devuelve null cuando todos los insumos están bien', () => {
        expect(buildProductStockAlert([evaluation('OK'), evaluation('OK')])).toBeNull();
    });

    it('devuelve null cuando el producto no tiene receta', () => {
        expect(buildProductStockAlert([])).toBeNull();
    });

    it('da WARNING cuando algún insumo está bajo mínimo', () => {
        expect(buildProductStockAlert([evaluation('OK'), evaluation('LOW')])).toBe('WARNING');
    });

    it('da ERROR cuando un insumo obligatorio está agotado', () => {
        expect(buildProductStockAlert([evaluation('LOW'), evaluation('OUT')])).toBe('ERROR');
    });

    // Sin el opcional el producto se sigue pudiendo preparar.
    it('da WARNING cuando el único agotado es opcional', () => {
        expect(buildProductStockAlert([evaluation('OK'), evaluation('OUT', true)])).toBe('WARNING');
    });
});
