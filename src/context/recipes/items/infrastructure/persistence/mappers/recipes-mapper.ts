import { RecipeItem } from "../../../domain";
import { RecipeItemEntity } from "../models/recipe-item.entity";
import { RecipeItemResponse } from "../../../domain";

export class RecipeItemMapper {

    static toEntity(recipeItem: RecipeItem): RecipeItemEntity {
        const primitives = recipeItem.toPrimitives();

        return {
            id: primitives.id,
            productId: primitives.productId,
            inventoryItemId: primitives.inventoryItemId,
            quantity: primitives.quantity,
            unit: primitives.unit,
            lineCost: primitives.lineCost,
            isOptional: primitives.isOptional,
        } as RecipeItemEntity;
    }

    static toDomain(entity: RecipeItemEntity): RecipeItem {
        return RecipeItem.fromPrimitives({
            id: entity.id,
            productId: entity.productId,
            inventoryItemId: entity.inventoryItemId,
            quantity: entity.quantity,
            unit: entity.unit,
            lineCost: entity.lineCost,
            isOptional: entity.isOptional,
        });
    }

    static toResponse(entity: RecipeItemEntity): RecipeItemResponse {
        return {
            id: entity.id,
            productId: entity.productId,
            inventoryItemId: entity.inventoryItemId,
            quantity: entity.quantity,
            unit: entity.unit,
            lineCost: entity.lineCost,
            isOptional: entity.isOptional,
            updatedAt: entity.updatedAt,
        };
    }
    static toPersistence(recipeItem: RecipeItem) {
    const primitives = recipeItem.toPrimitives();

    return {
        productId: primitives.productId,
        inventoryItemId: primitives.inventoryItemId,
        quantity: primitives.quantity,
        unit: primitives.unit,
        lineCost: primitives.lineCost,
        isOptional: primitives.isOptional,
    };
}
}