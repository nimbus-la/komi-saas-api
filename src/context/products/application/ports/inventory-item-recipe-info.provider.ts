export interface InventoryItemRecipeInfo {
    inventoryItemId: string;
    name: string;
    unitOfMeasure: string;
    unitCostAmount: string | null;
    currentStock: string;
}

export abstract class InventoryItemRecipeInfoProvider {
    abstract get(
        tenantId: string,
        inventoryItemId: string,
    ): Promise<InventoryItemRecipeInfo | null>;
}