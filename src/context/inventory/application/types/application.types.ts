export interface Pagination {
    pageNumber: number;
    pageSize: number;
};



export interface Paginated<T> {
    data: T[];
    pageNumber: number;
    pageSize: number;
    total: number;
};



export interface InventoryBatchView {
    id: string;
    quantityReceived: string;
    quantityRemaining: string;
    unitCostAmount: string;
    unitCostCurrency: string;
    expirationDate: string | null;
    receivedAt: Date;
    isExpired: boolean;
    isDepleted: boolean;
};



export interface InventoryItemResponse {
    id: string;
    tenantId: string;
    sku: string;
    name: string;
    unitOfMeasure: string;
    effectiveCostAmount: string | null;     // ponderado de lotes, o el estándar como fallback
    currency: string;
    isPerishable: boolean;
    isActive: boolean;
    currentStock: string;            // Σ restante de lotes activos (derivado)
    createdAt: Date;
    updatedAt: Date;
};