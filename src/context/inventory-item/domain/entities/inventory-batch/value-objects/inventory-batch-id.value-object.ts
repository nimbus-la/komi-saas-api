import { generateUUID, Uuid } from "@/shared";

export class InventoryBatchId extends Uuid {
    private constructor(value: string) {
        super(value);
    };


    public static create(value: string): InventoryBatchId {
        return new InventoryBatchId(value);
    };


    public static generate(): InventoryBatchId {
        return new InventoryBatchId(generateUUID());
    };
};