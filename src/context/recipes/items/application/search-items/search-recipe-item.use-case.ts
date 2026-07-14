import { Injectable } from "@nestjs/common";

import {
  RecipeItemRepository,
  RecipeItemResponse,
  SearchRecipeItemsApplicationParams,
} from "../../domain";

@Injectable()
export class SearchRecipeItemsUseCase {
  constructor(
    private readonly repository: RecipeItemRepository,
  ) {}

  public async execute(
    params: SearchRecipeItemsApplicationParams,
  ): Promise<RecipeItemResponse[]> {
    return await this.repository.search(params);
  }
}