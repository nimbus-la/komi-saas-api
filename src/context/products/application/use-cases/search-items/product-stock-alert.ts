import { IngredientStockStatus } from "@/context/products/domain/recipe/recipe-ingredient-primitives";
import { StockAlertLevel } from "@/context/products/domain/interfaces/product.response";

/** Resultado de evaluar un insumo de la receta en la sucursal. */
export interface IngredientStockEvaluation {
    status: IngredientStockStatus;
    isOptional: boolean;
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
): StockAlertLevel | null => {
    const withProblems = evaluations.filter((evaluation) => evaluation.status !== 'OK');

    if (withProblems.length === 0) {
        return null;
    }

    const blocksProduct = withProblems.some(
        (evaluation) => evaluation.status === 'OUT' && !evaluation.isOptional,
    );

    return blocksProduct ? 'ERROR' : 'WARNING';
};
