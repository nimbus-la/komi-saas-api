import { generateUUID, Uuid } from "@/shared";

export class ProductId extends Uuid {
    private constructor(value: string) {
        super(value);
    }

    public static create(value: string): ProductId {
        return new ProductId(value);
    }

    public static generate(): ProductId {
        return new ProductId(generateUUID());
    }
}