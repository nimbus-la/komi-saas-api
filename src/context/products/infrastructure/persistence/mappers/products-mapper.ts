import { ProductResponse } from "@/context/products/domain/interfaces/product.response";
import { ProductEntity } from "../models/product.entity";

import { Product } from "@/context/products/domain";
import { RecipeIngredientPrimitives, RecipeIngredientResponse } from "@/context/products/domain/recipe/recipe-ingredient-primitives";
import { RecipeIngredientEntity } from "../models/recipe-ingredient.entity";
import { ProductBranchConfigEntity } from "@/context/product-branch-config/infrastructure/persistence/models/product-branch-config.entity";

export class ProductMapper {

    /** Con la configuración de una sucursal, su precio reemplaza al general. */
    static toResponse(
        row: ProductEntity,
        ingredients: ProductResponse["ingredients"] = [],
        branchConfig?: ProductBranchConfigEntity,
    ): ProductResponse {
        const response = ProductMapper.toGeneralResponse(row, ingredients);

        if (branchConfig === undefined) {
            return response;
        }

        return {
            ...response,
            ...(branchConfig.priceAmount !== null
                ? {
                    productBasePrice: branchConfig.priceAmount,
                    costCurrency: branchConfig.priceCurrency ?? response.costCurrency,
                }
                : {}),
        };
    }

    private static toGeneralResponse(
        row: ProductEntity,
        ingredients: ProductResponse["ingredients"],
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
            status: row.status,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            ingredients,
        };
    }

    static toDomain(
        row: ProductEntity,
        ingredients: RecipeIngredientResponse[] = [],
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
            status: row.status,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            ingredients
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
            status: primitives.status,
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

            // Se completan después en SearchProductsUseCase
            name: "",
            unitOfMeasure: "",
            unitCostAmount: null,
            lineCostAmount: null,
            hasStock: false,
        }));
    }
}
