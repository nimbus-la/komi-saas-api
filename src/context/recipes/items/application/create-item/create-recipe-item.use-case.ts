import { Inject, Injectable } from "@nestjs/common";

import {
  CreateRecipeItemApplicationParams,
  RecipeItem,
  RecipeItemRepository,
} from "../../domain";

@Injectable()
export class CreateRecipeItemUseCase {
  constructor(
    @Inject(RecipeItemRepository)
    private readonly repository: RecipeItemRepository,
  ) {}

  async execute(
    params: CreateRecipeItemApplicationParams,
  ): Promise<RecipeItem> {

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