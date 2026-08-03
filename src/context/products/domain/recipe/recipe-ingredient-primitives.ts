export interface RecipeIngredientPrimitives {
    id: string;
    inventoryItemId: string;
    quantity: string;
    isOptional: boolean;
}
// recipe-ingredient.response.ts

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
}