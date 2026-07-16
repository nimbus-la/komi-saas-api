import { RecipeItemPrimitives } from "./recipe-item-primitives";

export interface RecipeItemResponse extends RecipeItemPrimitives {
    updatedAt: Date;
}