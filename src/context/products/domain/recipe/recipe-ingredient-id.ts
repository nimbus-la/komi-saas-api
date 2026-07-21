import { generateUUID, Uuid } from "@/shared";

export class RecipeIngredientId extends Uuid {
    private constructor(value: string) {
        super(value);
    }

    public static create(value: string): RecipeIngredientId {
        return new RecipeIngredientId(value);
    }

    public static generate(): RecipeIngredientId {
        return new RecipeIngredientId(generateUUID());
    }
}