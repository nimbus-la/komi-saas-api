import { ProductResponse } from "@/context/products/domain/types/product.response";
import { ProductEntity } from "../models/product.entity";

import { Product } from "@/context/products/domain";
import { RecipeIngredientPrimitives } from "@/context/products/domain/recipe/recipe-ingredient-primitives";
import { RecipeIngredientEntity } from "../models/recipe-ingredient.entity";

export class ProductMapper {

    static toResponse(
        row: ProductEntity,
        ingredients: ProductResponse["ingredients"] = [],
    ): ProductResponse {
        return {
            id: row.id,
            tenantId: row.tenantId,
            productCategoryId: row.productCategoryId,
            productName: row.name,
            productDescription: row.description ?? undefined,
            productSku: row.sku,
            productImgUrl: row.imageUrl ?? undefined,
            productBasePrice: row.basePrice,
            costCurrency: "COP",
            profitMargin: row.profitMargin,
            productStatus: row.isActive,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            ingredients,
        };
    }

    static toDomain(
        row: ProductEntity,
        ingredients: RecipeIngredientPrimitives[] = [],
    ): Product {

        return Product.fromPrimitives({
            id: row.id,
            tenantId: row.tenantId,
            productCategoryId: row.productCategoryId,
            productName: row.name,
            productDescription: row.description ?? undefined,
            productSku: row.sku,
            productImgUrl: row.imageUrl ?? undefined,
            productBasePrice: row.basePrice,
            costCurrency: "COP",
            profitMargin: row.profitMargin,
            productStatus: row.isActive,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            ingredients,
        });

    }

    static toEntity(product: Product): Partial<ProductEntity> {

        const primitives = product.toPrimitives();

        return {
            id: primitives.id,
            tenantId: primitives.tenantId,
            productCategoryId: primitives.productCategoryId,
            name: primitives.productName,
            description: primitives.productDescription ?? null,
            sku: primitives.productSku,
            imageUrl: primitives.productImgUrl ?? null,
            basePrice: primitives.productBasePrice,
            profitMargin: primitives.profitMargin.toString(),
            isActive: primitives.productStatus,
        };
    }
    static toCreateResponse(product: Product) {
        const primitives = product.toPrimitives();

        return {
            productCategoryId: primitives.productCategoryId,
            tenantId: primitives.tenantId,
            productName: primitives.productName,
            productDescription: primitives.productDescription,
            productImgUrl: primitives.productImgUrl,
            productBasePrice: primitives.productBasePrice,
            profitMargin: primitives.profitMargin,
            recipe: primitives.ingredients.map((ingredient) => ({
                inventoryItemId: ingredient.inventoryItemId,
                quantity: ingredient.quantity,
                isOptional: ingredient.isOptional,
            })),
        };
    }
    static mapIngredients(
        productId: string,
        ingredients: RecipeIngredientPrimitives[],
    ): RecipeIngredientEntity[] {
        return ingredients.map((ingredient) => {
            const entity = new RecipeIngredientEntity();

            entity.id = ingredient.id;
            entity.productId = productId;
            entity.inventoryItemId = ingredient.inventoryItemId;
            entity.quantity = ingredient.quantity;
            entity.isOptional = ingredient.isOptional;

            return entity;
        });
    }
    static toIngredientsResponse(
        ingredients: RecipeIngredientEntity[],
    ): ProductResponse["ingredients"] {
        return ingredients.map((ingredient) => ({
            id: ingredient.id,
            inventoryItemId: ingredient.inventoryItemId,
            quantity: ingredient.quantity,
            isOptional: ingredient.isOptional,
        }));
    }
}
