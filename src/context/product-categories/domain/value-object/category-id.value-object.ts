import { generateUUID, Uuid } from "@/shared";

export class CategoryId extends Uuid {
    private constructor(value: string) {
        super(value);
    }

    public static create(value: string): CategoryId {
        return new CategoryId(value);
    }

    public static generate(): CategoryId {
        return new CategoryId(generateUUID());
    }
}