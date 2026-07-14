import { Money, Quantity } from "@/shared";
import { MovementType } from "../common/catalog.common";
import { InventoryMovementType } from "../value-objects/inventory-movement-type.value-object";



export interface InventoryMovementCreated {
    tenantId: string;
    inventoryItemId: string;
    branchId: string;
    batchId: string | null;
    movementType: InventoryMovementType;
    quantity: Quantity;
    unitCost?: Money | null;
    reason?: string | null;
    occurredAt?: Date;
};



export interface InventoryMovementPrimitives {
    id: string;
    tenantId: string;
    inventoryItemId: string;
    branchId: string;
    batchId: string | null;
    movementType: MovementType;
    quantity: string;
    unitCostAmount: string | null;
    unitCostCurrency: string | null;
    reason: string | null;
    // userId: string | null;          // pendiente: módulo de usuarios/auth
    occurredAt: Date;
    registeredAt: Date;
};