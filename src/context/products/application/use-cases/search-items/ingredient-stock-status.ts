import { IngredientStockStatus } from "@/context/products/domain/recipe/recipe-ingredient-primitives";

/** Lo que se sabe de un insumo en la sucursal evaluada. */
export interface IngredientStockSnapshot {
    isActive: boolean;
    currentStock: string;
    minStock: string | null;
}

/**
 * Estado de un insumo de la receta en una sucursal:
 *   - OUT: el insumo no existe, está inactivo o su stock no alcanza para
 *     preparar una unidad del producto (incluye stock 0).
 *   - LOW: alcanza, pero está por debajo del mínimo efectivo de la sede. Es
 *     estricto: stock igual al mínimo no cuenta. Sin mínimo configurado nunca
 *     se llega a LOW.
 *   - OK: cualquier otro caso.
 *
 * No mira si el ingrediente es opcional: eso lo decide el nivel del producto.
 */
export const resolveIngredientStockStatus = (
    snapshot: IngredientStockSnapshot | null,
    requiredQuantity: string,
): IngredientStockStatus => {
    if (snapshot === null || !snapshot.isActive) {
        return 'OUT';
    }

    const stock = Number(snapshot.currentStock);

    if (stock <= 0 || stock < Number(requiredQuantity)) {
        return 'OUT';
    }

    if (snapshot.minStock !== null && stock < Number(snapshot.minStock)) {
        return 'LOW';
    }

    return 'OK';
};
