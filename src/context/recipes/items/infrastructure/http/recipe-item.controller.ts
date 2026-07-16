import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
} from "@nestjs/common";

import { CreateRecipeItemDto } from "./dto/create-recipe-item.dto";
import { UpdateRecipeItemDto } from "./dto/update-recipe-item.dto";
import { SearchRecipeItemDto } from "./dto/search-recipe-item.dto";

import {
  CreateRecipeItemUseCase,
  SearchRecipeItemsUseCase,
  UpdateRecipeItemUseCase,
} from "../../application";
import { ResponseUtil } from "@/utils/response.util";


@Controller("recipe-items")
export class RecipeItemController {
  constructor(
    private readonly createRecipeItemUseCase: CreateRecipeItemUseCase,
    private readonly updateRecipeItemUseCase: UpdateRecipeItemUseCase,
    private readonly searchRecipeItemsUseCase: SearchRecipeItemsUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateRecipeItemDto) {
    const data = await this.createRecipeItemUseCase.execute(dto);

    return ResponseUtil.success(
      "Recipe item creado con éxito",
      data,
    );
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateRecipeItemDto,
  ) {
    const data = await this.updateRecipeItemUseCase.execute({
      ...dto,
      id,
    });

    return ResponseUtil.success(
      "Recipe item actualizado con éxito",
      data,
    );
  }

  @Get()
  async search(@Query() dto: SearchRecipeItemDto) {
    const data = await this.searchRecipeItemsUseCase.execute(dto);

    return ResponseUtil.success(
      "Consulta de recipe items exitosa",
      data,
    );
  }
}