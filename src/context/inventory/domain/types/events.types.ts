import { ConsumedBatchDetail } from "./domain.types";

export interface StockReceivedEventParams {
    itemId: string;
    tenantId: string;
    branchId: string;
    batchId: string;
    quantity: string;
    unitCostAmount: string;
    unitCostCurrency: string;
    occurredOn: Date;
};



export type StockConsumeEventParams = Omit<StockReceivedEventParams, 'batchId' | 'unitCostAmount' | 'unitCostCurrency'> & {
    consumedBatches: ConsumedBatchDetail[];
};