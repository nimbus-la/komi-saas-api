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



export interface BranchMinimumEntry {
    branchId: string;
    minStock: string | null;
};



/**
 * Minimo GLOBAL del item: el umbral por defecto que aplica a toda sucursal sin
 * override propio. minStock null limpia el minimo global.
 */
export interface SetGlobalMinimumStockParams {
    itemId: string;
    minStock: string | null;
};



/**
 * Minimo POR SUCURSAL, en lote. Es parcial: solo afecta las sucursales enviadas;
 * las que no vengan conservan su configuracion. Una entrada con minStock null
 * elimina el override de esa sede (vuelve a heredar el minimo global).
 */
export interface SetBranchMinimumStockParams {
    itemId: string;
    branches: BranchMinimumEntry[];
};