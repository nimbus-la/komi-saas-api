import { IngredientStockStatus } from "@/context/products/domain/recipe/recipe-ingredient-primitives";
import { ProductStockAlert, StockAlertItem } from "@/context/products/domain/types/product.response";

/** Resultado de evaluar un insumo de la receta en la sucursal. */
export interface IngredientStockEvaluation extends Omit<StockAlertItem, 'status'> {
    status: IngredientStockStatus;
}

/**
 * Alerta del producto a partir de sus insumos:
 *   - ERROR: algún insumo obligatorio está agotado; el producto no se puede preparar.
 *   - WARNING: hay insumos bajo mínimo, u opcionales agotados (el producto se
 *     sigue pudiendo preparar sin ellos).
 *   - null: todos los insumos están bien.
 */
export const buildProductStockAlert = (
    evaluations: IngredientStockEvaluation[],
): ProductStockAlert | null => {
    const items: StockAlertItem[] = [];

    for (const evaluation of evaluations) {
        if (evaluation.status !== 'OK') {
            items.push({ ...evaluation, status: evaluation.status });
        }
    }

    if (items.length === 0) {
        return null;
    }

    const blocksProduct = items.some((item) => item.status === 'OUT' && !item.isOptional);

    return {
        level: blocksProduct ? 'ERROR' : 'WARNING',
        items,
    };
};
