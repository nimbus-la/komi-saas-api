import { InventoryMovement, MovementType } from "../../../domain";
import { InventoryMovementView } from "../../../application";
import { InventoryMovementModel } from "../models/inventory-movements.models";


export class InventoryMovementPersistenceMapper {
    public static toPersistence(movement: InventoryMovement): InventoryMovementModel {
        const {
            id,
            tenantId,
            inventoryItemId,
            branchId,
            movementType,
            quantity,
            unitCostAmount,
            unitCostCurrency,
            reason,
            occurredAt,
            registeredAt
        } = movement.toPrimitives();


        return {
            id,
            tenantId,
            inventoryItemId,
            branchId,
            movementType,
            quantity,
            unitCostAmount,
            unitCostCurrency,
            reason,
            occurredAt,
            registeredAt
        };
    };


    public static toAggregate(row: InventoryMovementModel): InventoryMovement {
        const {
            id,
            tenantId,
            inventoryItemId,
            branchId,
            movementType,
            quantity,
            unitCostAmount,
            unitCostCurrency,
            reason,
            occurredAt,
            registeredAt
        } = row;


        return InventoryMovement.fromPrimitives({
            id,
            tenantId,
            inventoryItemId,
            branchId,
            movementType: movementType as MovementType,
            quantity,
            unitCostAmount,
            unitCostCurrency,
            reason,
            occurredAt,
            registeredAt
        });
    };


    public static movementResponse(movements: InventoryMovementModel[]): InventoryMovementView[] {
        return movements.map(
            (movement: InventoryMovementModel) => ({
                id: movement.id,
                inventoryItemId: movement.inventoryItemId,
                branchId: movement.branchId,
                movementType: movement.movementType as MovementType,
                quantity: movement.quantity,
                unitCostAmount: movement.unitCostAmount,
                unitCostCurrency: movement.unitCostCurrency,
                reason: movement.reason,
                occurredAt: movement.occurredAt,
            })
        );
    };
};