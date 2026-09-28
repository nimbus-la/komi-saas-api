/** Stock de un insumo en UNA sucursal: solo lotes activos (con existencias y sin vencer). */
export interface InventoryItemBranchStock {
    currentStock: string;
    /** Mínimo efectivo de la sede (override o global); null si no hay política de mínimos. */
    minStock: string | null;
}

export interface InventoryItemRecipeInfo {
    inventoryItemId: string;
    name: string;
    unitOfMeasure: string;
    unitCostAmount: string | null;
    currentStock: string;
    isActive: boolean;
    /** Solo viene cuando se pidió una sucursal. */
    branchStock?: InventoryItemBranchStock;
}

export abstract class InventoryItemRecipeInfoProvider {
    /**
     * Información de varios insumos en una sola carga, indexada por su id. Los
     * que no existan o sean de otro negocio no aparecen en el Map. Con branchId,
     * cada insumo trae además su stock y mínimo en esa sucursal.
     */
    abstract getMany(
        tenantId: string,
        inventoryItemIds: string[],
        branchId?: string,
    ): Promise<Map<string, InventoryItemRecipeInfo>>;
}
