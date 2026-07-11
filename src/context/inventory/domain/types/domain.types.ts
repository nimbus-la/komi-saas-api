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



export interface InventoryStockPrimitives {
    id: string;
    branchId: string;
    minStock: string;
};



export interface InventoryItemPrimitives {
    id: string;
    tenantId: string;
    sku: string;
    name: string;
    unitOfMeasure: string;
    isPerishable: boolean;
    isActive: boolean;
    minGlobalStock: string | null;
    createdAt: Date;
    updatedAt: Date;
    batches: InventoryBatchPrimitives[];
    stocks: InventoryStockPrimitives[];
};