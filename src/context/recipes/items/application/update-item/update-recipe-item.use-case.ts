import { Injectable } from "@nestjs/common";

import {
  RecipeItemRepository,
  RecipeItemId,
} from "../../domain";

import {
  UpdateRecipeItemApplicationParams,
} from "../../domain/types";

@Injectable()
export class UpdateRecipeItemUseCase {
  constructor(
    private readonly repository: RecipeItemRepository,
  ) {}

  public async execute(
    params: UpdateRecipeItemApplicationParams,
  ): Promise<void> {

    const recipeItem = await this.repository.findById(
      RecipeItemId.create(params.id),
    );

    if (!recipeItem) {
      throw new Error("Recipe item no encontrado.");
    }

    recipeItem.update({
      productId: params.productId,
      inventoryItemId: params.inventoryItemId,
      quantity: params.quantity,
      unit: params.unit,
      lineCost: params.lineCost,
      isOptional: params.isOptional,
    });

    await this.repository.update(recipeItem);
  }
}