import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { RecipeItemEntity } from "./infrastructure/persistence/recipe-item.entity";
import { RecipeItemRepository } from "./domain";
import { RecipeItemRepositoryImpl } from "./infrastructure/persistence/recipe-item.repository.impl";

import { CreateRecipeItemUseCase } from "./application/create-item/create-recipe-item.use-case";
import { UpdateRecipeItemUseCase } from "./application/update-item/update-recipe-item.use-case";
import { SearchRecipeItemsUseCase } from "./application/search-items/search-recipe-item.use-case";

import { RecipeItemController } from "./infrastructure/http/recipe-item.controller";
import { RecipeItemService } from "./infrastructure/http/recipe-item.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RecipeItemEntity,
    ]),
  ],
  controllers: [
    RecipeItemController,
  ],
  providers: [
    RecipeItemService,

    CreateRecipeItemUseCase,
    UpdateRecipeItemUseCase,
    SearchRecipeItemsUseCase,

    {
      provide: RecipeItemRepository,
      useClass: RecipeItemRepositoryImpl,
    },
  ],
  exports: [
    RecipeItemRepository,
  ],
})
export class RecipeItemModule {}