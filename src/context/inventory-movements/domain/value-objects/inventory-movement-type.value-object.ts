import { MovementType } from "../common/catalog.common";
import { InvalidInventoryMovementException } from "../exceptions/inventory-movement.exceptions";

export class InventoryMovementType {
    private constructor(
        public readonly value: MovementType
    ) { };

    
    public static created(type: string) {
        const normalized = type.trim().toUpperCase();

        if (!Object.values(MovementType).includes(normalized as MovementType)) {
            throw new InvalidInventoryMovementException(type);
        };

        return new InventoryMovementType(type as MovementType);
    };


    public requiresReason(): boolean {
        return [
            MovementType.Waste,
            MovementType.AdjustmentIn,
            MovementType.AdjustmentOut,
        ].includes(this.value);
    }
}