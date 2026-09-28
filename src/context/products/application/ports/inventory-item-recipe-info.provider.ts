export interface InventoryItemRecipeInfo {
    inventoryItemId: string;
    name: string;
    unitOfMeasure: string;
    unitCostAmount: string | null;
    currentStock: string;
}

export abstract class InventoryItemRecipeInfoProvider {
    /**
     * Información de varios insumos en una sola carga, indexada por su id. Los
     * que no existan o sean de otro negocio no aparecen en el Map.
     */
    abstract getMany(
        tenantId: string,
        inventoryItemIds: string[],
    ): Promise<Map<string, InventoryItemRecipeInfo>>;
}