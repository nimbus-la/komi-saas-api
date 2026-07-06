import { generateUUID, Uuid } from "@/shared";

export class InventoryItemId extends Uuid {
    private constructor(value: string) {
        super(value);
    };


    public static create(value: string): InventoryItemId {
        return new InventoryItemId(value);
    };


    public static generate(): InventoryItemId {
        return new InventoryItemId(generateUUID());
    };
};