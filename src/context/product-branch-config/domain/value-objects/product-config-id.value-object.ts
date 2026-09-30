import { generateUUID, Uuid } from "@/shared";

export class ProductBranchConfigId extends Uuid {
    private constructor(value: string) {
        super(value);
    }

    public static create(value: string): ProductBranchConfigId {
        return new ProductBranchConfigId(value);
    }

    public static generate(): ProductBranchConfigId {
        return new ProductBranchConfigId(generateUUID());
    }
}