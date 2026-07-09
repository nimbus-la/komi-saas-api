import { RecipeItem } from "./recipe-item.aggregate";
import {
    RecipeItemResponse,
    SearchRecipeItemsApplicationParams,
} from "./types";
import { RecipeItemId } from "./value-object";

export abstract class RecipeItemRepository {
    abstract save(recipeItem: RecipeItem): Promise<void>;

    abstract update(recipeItem: RecipeItem): Promise<void>;

    abstract search(
        params: SearchRecipeItemsApplicationParams,
    ): Promise<RecipeItemResponse[]>;

    abstract findById(id: RecipeItemId): Promise<RecipeItem | null>;
}