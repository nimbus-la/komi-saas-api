export interface StockReceivedEventParams {
    itemId: string;
    tenantId: string;
    branchId: string;
    quantity: string;
    unitCostAmount: string;
    unitCostCurrency: string;
    occurredOn: Date;
};



export type StockConsumeEventParams = Omit<StockReceivedEventParams, 'unitCostAmount' | 'unitCostCurrency'>;