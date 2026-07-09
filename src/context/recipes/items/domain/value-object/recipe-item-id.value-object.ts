import { generateUUID, Uuid } from "@/shared";

export class RecipeItemId extends Uuid {
    private constructor(value: string) {
        super(value);
    }

    public static create(value: string): RecipeItemId {
        return new RecipeItemId(value);
    }

    public static generate(): RecipeItemId {
        return new RecipeItemId(generateUUID());
    }
}