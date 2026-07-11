import { generateUUID, Uuid } from "@/shared";

export class InventoryStockId extends Uuid {
    private constructor(value: string) {
        super(value);
    };


    public static create(value: string): InventoryStockId {
        return new InventoryStockId(value);
    };


    public static generate(): InventoryStockId {
        return new InventoryStockId(generateUUID());
    };
};