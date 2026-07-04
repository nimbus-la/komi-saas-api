export interface InventoryItemResponse {
    id: string;
    name: string;
    unitOfMeasure: string;
    standardCostAmount: string;      // costo de referencia del item
    effectiveCostAmount: string;     // ponderado de lotes, o el estándar como fallback
    costSource: 'BATCHES' | 'STANDARD';
    costCurrency: string;
    isPerishable: boolean;
    isActive: boolean;
    currentStock: string;            // Σ restante de lotes activos (derivado)
    createdAt: Date;
    updatedAt: Date;
};