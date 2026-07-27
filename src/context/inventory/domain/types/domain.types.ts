import { Quantity } from "@/shared";

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



export interface InventoryBranchConfigPrimitives {
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
    branchConfigs: InventoryBranchConfigPrimitives[];
};



export interface ConsumedBatchDetail {
    batchId: string;
    quantity: string;
    unitCostAmount: string;
    unitCostCurrency: string;
};



export interface WastedBatchDetail {
    batchId: string;
    quantity: string;
    unitCostAmount: string;
    unitCostCurrency: string;
};



export type AdjustmentDirection = 'IN' | 'OUT';



export interface AdjustedBatchDetail {
    batchId: string;
    direction: AdjustmentDirection;
    quantity: string;
    unitCostAmount: string;
    unitCostCurrency: string;
};



export interface RegisterWasteParams {
    branchId: string;
    quantity: Quantity;
    reason: string;
    occurredAt?: Date;
};



export interface AdjustBatchParams {
    batchId: string;
    actualQuantity: Quantity;
    reason: string;
    occurredAt?: Date;
};



export interface CountStockParams {
    branchId: string;
    actualTotal: Quantity;
    reason: string;
    occurredAt?: Date;
};