import { IngredientStockStatus } from "../recipe/recipe-ingredient-primitives";
import { ProductPrimitives } from "./product-primitives";

/** Nivel de la alerta del producto; el frontend decide el tono (warning o error). */
export type StockAlertLevel = 'WARNING' | 'ERROR';

/** Insumo de la receta que está bajo mínimo o agotado en la sucursal evaluada. */
export interface StockAlertItem {
    inventoryItemId: string;
    name: string;
    status: Exclude<IngredientStockStatus, 'OK'>;
    isOptional: boolean;
    currentStock: string;
    minStock: string | null;
    requiredQuantity: string;
    branchId: string;
}

export interface ProductStockAlert {
    level: StockAlertLevel;
    items: StockAlertItem[];
}

export interface ProductResponse extends ProductPrimitives {
    createdAt: Date;
    updatedAt: Date;
    /**
     * Solo viene cuando la búsqueda recibió una sucursal. null significa que
     * todos los insumos están bien; sin sucursal el campo no se incluye.
     */
    stockAlert?: ProductStockAlert | null;
}
