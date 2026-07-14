import { InventoryMovement } from "./inventory-movement.aggregate";

export abstract class InventoryMovementRepository {
    abstract save(movement: InventoryMovement): Promise<void>;
};