import { Injectable } from "@nestjs/common";

import { CreateRecipeItemDto } from "../http/dto/create-recipe-item.dto";
import { UpdateRecipeItemDto } from "../http/dto/update-recipe-item.dto";

import { CreateRecipeItemUseCase } from "../../application/create-item/create-recipe-item.use-case";
import { UpdateRecipeItemUseCase } from "../../application/update-item/update-recipe-item.use-case";
import { SearchRecipeItemsUseCase } from "../../application/search-items/search-recipe-item.use-case";

import { SearchRecipeItemsApplicationParams } from "../../domain";

@Injectable()
export class RecipeItemService {
  constructor(
    private readonly createRecipeItemUseCase: CreateRecipeItemUseCase,
    private readonly updateRecipeItemUseCase: UpdateRecipeItemUseCase,
    private readonly searchRecipeItemsUseCase: SearchRecipeItemsUseCase,
  ) {}

  async create(dto: CreateRecipeItemDto) {
    return this.createRecipeItemUseCase.execute(dto);
  }

  async update(id: string, dto: UpdateRecipeItemDto) {
    return this.updateRecipeItemUseCase.execute({
      id,
      ...dto,
    });
  }

  async search(params: SearchRecipeItemsApplicationParams) {
    return this.searchRecipeItemsUseCase.execute(params);
  }

  async findAll() {
    return [];
  }
}