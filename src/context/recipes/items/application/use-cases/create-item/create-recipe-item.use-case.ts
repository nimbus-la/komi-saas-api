import { Inject, Injectable } from "@nestjs/common";

import {
  CreateRecipeItemApplicationParams,
  RecipeItem,
  RecipeItemRepository,
} from "../../../domain";
import { RecipeAlreadyExistsException } from "../../../domain/exceptions/recipe-exceptions";

@Injectable()
export class CreateRecipeItemUseCase {
  constructor(
    @Inject(RecipeItemRepository)
    private readonly repository: RecipeItemRepository,
  ) { }

  async execute(
    params: CreateRecipeItemApplicationParams,
  ): Promise<RecipeItem> {
    const exists = await this.repository.existsRecipeItem(
      params.productId,
      params.inventoryItemId,
      params.quantity,
      params.unit,
    );

    if (exists) {
      throw new RecipeAlreadyExistsException(
        params.productId,
      );
    }

    const recipeItem = RecipeItem.create({
      productId: params.productId,
      inventoryItemId: params.inventoryItemId,
      quantity: params.quantity,
      unit: params.unit,
      lineCost: params.lineCost,
      isOptional: params.isOptional,
    });

    await this.repository.save(recipeItem);

    return recipeItem;
  }
}