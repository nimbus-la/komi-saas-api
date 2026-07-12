import { generateUUID, Uuid } from "@/shared";

export class InventoryMovementId extends Uuid {
    private constructor(value: string) {
        super(value);
    };

    public static create(value: string): InventoryMovementId {
        return new InventoryMovementId(value);
    };

    public static generate(): InventoryMovementId {
        return new InventoryMovementId(generateUUID());
    };
};