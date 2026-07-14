import { MovementType } from "../../domain";

export interface InventoryMovementView {
    id: string;
    inventoryItemId: string;
    branchId: string;
    movementType: MovementType;
    quantity: string;
    unitCostAmount: string | null;
    unitCostCurrency: string | null;
    reason: string | null;
    occurredAt: Date;
};


export interface MovementSearchFilters {
    inventoryItemId?: string;
    branchId?: string;
    movementType?: MovementType;
};


export interface RecordMovementParams {
    tenantId: string;
    inventoryItemId: string;
    branchId: string;
    movementType: MovementType;
    quantity: string;
    unitCostAmount?: string;
    unitCostCurrency?: string;
    reason?: string;
    // userId?: string;
    occurredAt?: Date;
};