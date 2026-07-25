import { generateUUID, Uuid } from "@/shared";

export class InventoryBranchConfigId extends Uuid {
    private constructor(value: string) {
        super(value);
    };


    public static create(value: string): InventoryBranchConfigId {
        return new InventoryBranchConfigId(value);
    };


    public static generate(): InventoryBranchConfigId {
        return new InventoryBranchConfigId(generateUUID());
    };
};
