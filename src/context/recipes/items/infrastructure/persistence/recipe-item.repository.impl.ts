import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import {
    RecipeItem,
    RecipeItemRepository,
    RecipeItemResponse,
    SearchRecipeItemsApplicationParams,
    RecipeItemId,
} from "../../domain";


import { RecipeItemEntity } from "./recipe-item.entity";

@Injectable()
export class RecipeItemRepositoryImpl extends RecipeItemRepository {
    constructor(
        @InjectRepository(RecipeItemEntity)
        private readonly recipeItemRepository: Repository<RecipeItemEntity>,
    ) {
        super();
    }

    public async save(recipeItem: RecipeItem): Promise<void> {
        const primitives = recipeItem.toPrimitives();

        const row = this.recipeItemRepository.create({
            id: primitives.id,
            productId: primitives.productId,
            inventoryItemId: primitives.inventoryItemId,
            quantity: primitives.quantity,
            unit: primitives.unit,
            lineCost: primitives.lineCost,
            isOptional: primitives.isOptional,
        });

        await this.recipeItemRepository.save(row);
    }

    public async update(recipeItem: RecipeItem): Promise<void> {
        const primitives = recipeItem.toPrimitives();

        await this.recipeItemRepository.update(primitives.id, {
            productId: primitives.productId,
            inventoryItemId: primitives.inventoryItemId,
            quantity: primitives.quantity,
            unit: primitives.unit,
            lineCost: primitives.lineCost,
            isOptional: primitives.isOptional,
        });
    }

    public async search(
        params: SearchRecipeItemsApplicationParams,
    ): Promise<RecipeItemResponse[]> {

        const query = this.recipeItemRepository.createQueryBuilder("recipe_item");

        if (params.productId) {
            query.andWhere(
                "recipe_item.productId = :productId",
                { productId: params.productId },
            );
        }

        if (params.inventoryItemId) {
            query.andWhere(
                "recipe_item.inventoryItemId = :inventoryItemId",
                { inventoryItemId: params.inventoryItemId },
            );
        }

        query.skip((params.page - 1) * params.limit);
        query.take(params.limit);

        const rows = await query.getMany();

        return rows.map((row) => ({
            id: row.id,
            productId: row.productId,
            inventoryItemId: row.inventoryItemId,
            quantity: row.quantity,
            unit: row.unit,
            lineCost: row.lineCost,
            isOptional: row.isOptional,
            updatedAt: row.updatedAt,
        }));
    }

    public async findById(
        id: RecipeItemId,
    ): Promise<RecipeItem | null> {

        const row = await this.recipeItemRepository.findOne({
            where: {
                id: id.value,
            },
        });

        if (!row) {
            return null;
        }

        return RecipeItem.fromPrimitives({
            id: row.id,
            productId: row.productId,
            inventoryItemId: row.inventoryItemId,
            quantity: row.quantity,
            unit: row.unit,
            lineCost: row.lineCost,
            isOptional: row.isOptional,
        });
    }
}