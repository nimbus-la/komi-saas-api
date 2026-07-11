export interface InventoryItemCreatedProps {
    itemId: string;
    tenantId: string;
    sku: string;
    name: string;
    unitOfMeasure: string;
    isPerishable: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
};



export interface InventoryBatchPrimitives {
    id: string;
    branchId: string;
    quantityReceived: string;
    quantityRemaining: string;
    unitCostAmount: string;
    unitCostCurrency: string;
    expirationDate: string | null;
    receivedAt: Date;
};



export interface InventoryItemPrimitives {
    id: string;
    tenantId: string;
    sku: string;
    name: string;
    unitOfMeasure: string;
    isPerishable: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    batches: InventoryBatchPrimitives[];
};