import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
} from "@nestjs/common";

import { CreateRecipeItemUseCase } from "../../application/create-item/create-recipe-item.use-case";
import { UpdateRecipeItemUseCase } from "../../application/update-item/update-recipe-item.use-case";
import { SearchRecipeItemsUseCase } from "../../application/search-items/search-recipe-item.use-case";

import { CreateRecipeItemDto } from "./dto/create-recipe-item.dto";
import { UpdateRecipeItemDto } from "./dto/update-recipe-item.dto";
import { SearchRecipeItemDto } from "./dto/search-recipe-item.dto";

@Controller("recipe-items")
export class RecipeItemController {
  constructor(
    private readonly createRecipeItemUseCase: CreateRecipeItemUseCase,
    private readonly updateRecipeItemUseCase: UpdateRecipeItemUseCase,
    private readonly searchRecipeItemsUseCase: SearchRecipeItemsUseCase,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateRecipeItemDto,
  ) {
    return await this.createRecipeItemUseCase.execute(dto);
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateRecipeItemDto,
  ) {
    return await this.updateRecipeItemUseCase.execute({
      ...dto,
      id,
    });
  }

  @Get()
  async search(
    @Query() dto: SearchRecipeItemDto,
  ) {
    return await this.searchRecipeItemsUseCase.execute(dto);
  }
}