export interface RecipeIngredientPrimitives {
    id: string;
    inventoryItemId: string;
    quantity: string;
    isOptional: boolean;
}
// recipe-ingredient.response.ts

/** Estado del insumo en la sucursal: OK, bajo mínimo (LOW) o agotado (OUT). */
export type IngredientStockStatus = 'OK' | 'LOW' | 'OUT';

export interface RecipeIngredientResponse {
    id: string;
    inventoryItemId: string;
    name: string;
    quantity: string;
    unitOfMeasure: string;
    isOptional: boolean;
    unitCostAmount: string | null;
    lineCostAmount: string | null;
    hasStock: boolean;
    /** Solo viene cuando la búsqueda recibió una sucursal. */
    stockStatus?: IngredientStockStatus;
}