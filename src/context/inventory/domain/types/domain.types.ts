export interface InventoryItemCreatedProps {
    itemId: string;
    name: string;
    unitOfMeasure: string;
    costAmount: string;
    costCurrency: string;
    isPerishable: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
};



export interface InventoryBatchPrimitives {
    id: string;
    quantityReceived: string;
    quantityRemaining: string;
    unitCostAmount: string;
    unitCostCurrency: string;
    expirationDate: string | null;
    receivedAt: Date;
};



export interface InventoryItemPrimitives {
    id: string;
    name: string;
    unitOfMeasure: string;
    costAmount: string;
    costCurrency: string;
    isPerishable: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    batches: InventoryBatchPrimitives[];
};