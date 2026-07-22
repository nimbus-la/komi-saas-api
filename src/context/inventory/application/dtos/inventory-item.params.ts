export interface CreateInventoryItemParams {
    tenantId: string;
    name: string;
    unitOfMeasure: string;
    costCurrency?: string;
    isPerishable: boolean;
};



export interface ConsumeStockParams {
    itemId: string;
    branchId: string;
    quantity: string;
    consumedAt?: string;
};



export interface ReceiveStockParams {
    itemId: string;
    branchId: string;
    quantityReceived: string;
    totalCostAmount: string;
    expirationDate?: string | null;
    receivedAt?: string;
};



export interface SetMinimumStockParams {
    itemId: string;
    branchId?: string;        // ausente: mínimo GLOBAL; presente: override de la sucursal
    minStock: string | null;  // null (solo global): limpia el mínimo global
};



export interface UpdateInventoryItemParams {
    name?: string;
    costAmount?: string;
    costCurrency?: string;
    unitOfMeasure?: string;
    isPerishable?: boolean;
};



export interface RegisterWasteUseCaseParams {
    itemId: string;
    branchId: string;
    quantity: string;
    reason: string;
    occurredAt?: string;
};



export interface CountStockUseCaseParams {
    itemId: string;
    branchId: string;
    actualTotal: string;
    reason: string;
    occurredAt?: string;
};