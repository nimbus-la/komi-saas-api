import { ProductResponse } from "@/context/products/domain/types/product.response";
import { ProductEntity } from "../models/product.entity";
import { RecipeIngredientEntity } from "../models/recipe-ingredient.entity";

import { Product } from "@/context/products/domain";

export class ProductMapper {

    static toResponse(row: ProductEntity): ProductResponse {
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
            profitMargin: Number(row.profitMargin),
            productStatus: row.isActive,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,

            ingredients: (row.ingredients ?? []).map(
                (ingredient) => ({
                    id: ingredient.id,
                    inventoryItemId: ingredient.inventoryItemId,
                    quantity: ingredient.quantity,
                    isOptional: ingredient.isOptional,
                }),
            ),
        };
    }

    static toDomain(row: ProductEntity): Product {

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
            profitMargin: Number(row.profitMargin),
            productStatus: row.isActive,

            ingredients: (row.ingredients ?? []).map(
                (ingredient) => ({
                    id: ingredient.id,
                    inventoryItemId: ingredient.inventoryItemId,
                    quantity: ingredient.quantity,
                    isOptional: ingredient.isOptional,
                }),
            ),
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

            ingredients: primitives.ingredients.map(
                (ingredient) => {
                    const entity = new RecipeIngredientEntity();

                    entity.id = ingredient.id;
                    entity.productId = primitives.id;
                    entity.inventoryItemId =
                        ingredient.inventoryItemId;
                    entity.quantity = ingredient.quantity;
                    entity.isOptional = ingredient.isOptional;

                    return entity;
                },
            ),
        };
    }
}