import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import {
    RecipeItem,
    RecipeItemRepository,
    RecipeItemResponse,
    SearchRecipeItemsApplicationParams,
    RecipeItemId,
} from "../../../domain";


import { RecipeItemEntity } from "../models/recipe-item.entity";
import { RecipeItemMapper } from "../mappers/recipes-mapper";

@Injectable()
export class RecipeItemRepositoryImpl extends RecipeItemRepository {
    constructor(
        @InjectRepository(RecipeItemEntity)
        private readonly recipeItemRepository: Repository<RecipeItemEntity>,
    ) {
        super();
    }

    public async save(recipeItem: RecipeItem): Promise<void> {
        const entity = RecipeItemMapper.toEntity(recipeItem);
        const row = this.recipeItemRepository.create(entity);

        await this.recipeItemRepository.save(row);
    }

    public async update(recipeItem: RecipeItem): Promise<void> {
        const primitives = recipeItem.toPrimitives();

        await this.recipeItemRepository.update(
            primitives.id,
            RecipeItemMapper.toPersistence(recipeItem),
        );
    }

    public async search(
        params: SearchRecipeItemsApplicationParams,
    ): Promise<RecipeItemResponse[]> {

        const query = this.recipeItemRepository.createQueryBuilder("recipe_item");

        if (params.productId) {
            query.andWhere("recipe_item.productId = :productId", {
                productId: params.productId,
            });
        }

        if (params.inventoryItemId) {
            query.andWhere("recipe_item.inventoryItemId = :inventoryItemId", {
                inventoryItemId: params.inventoryItemId,
            });
        }

        query.skip((params.page - 1) * params.limit);
        query.take(params.limit);

        const rows = await query.getMany();

        return rows.map(RecipeItemMapper.toResponse);
    }

    public async findById(id: RecipeItemId): Promise<RecipeItem | null> {
        const row = await this.recipeItemRepository.findOne({
            where: { id: id.value },
        });

        if (!row) return null;

        return RecipeItemMapper.toDomain(row);
    }
   async existsRecipeItem(
  productId: string,
  inventoryItemId: string,
  quantity: string,
  unit: string,
): Promise<boolean> {

  return await this.recipeItemRepository.exists({
    where: {
      productId,
      inventoryItemId,
      quantity,
      unit,
    },
  });
}
}