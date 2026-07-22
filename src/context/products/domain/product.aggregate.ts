import { AggregateRoot, Money, Quantity } from "@/shared";

import { ProductCreatedEvent } from "./events/product-created.event";
import { ProductId } from "./value-object/product-id.value-object";
import { ProductName } from "./value-object/product-name.value-object";
import { ProductSku } from "./value-object/product-sku.value-object";
import { ProductPrimitives } from "./types/product-primitives";
import { DuplicateIngredientException } from "./recipe/exceptions/duplicate-ingredient.exception";
import { IngredientNotInRecipeException } from "./recipe/exceptions/ingredient-not-in-recipe.exception";
import { RecipeIngredient } from "./recipe/recipe-ingredient.entity";
import { RecipeParams } from "./types/product-application";

export class Product extends AggregateRoot<ProductId> {
    private tenantId: string;
    private productCategoryId: string;
    private productName: ProductName;
    private productDescription: string | undefined;
    private productSku: ProductSku;
    private productImgUrl: string | undefined;

    private productBasePrice: Money;
    private profitMargin: number;
    private productStatus: boolean;
    private ingredients: RecipeIngredient[];

    private constructor(
        id: ProductId,
        tenantId: string,
        productCategoryId: string,
        productName: ProductName,
        productDescription: string | undefined,
        productSku: ProductSku,
        productImgUrl: string | undefined,
        productBasePrice: Money,
        profitMargin: number,
        productStatus: boolean,
        ingredients: RecipeIngredient[],
    ) {
        super(id);
        this.tenantId = tenantId;
        this.productCategoryId = productCategoryId;
        this.productName = productName;
        this.productDescription = productDescription;
        this.productSku = productSku;
        this.productImgUrl = productImgUrl;
        this.productBasePrice = productBasePrice;
        this.profitMargin = profitMargin;
        this.productStatus = productStatus;
        this.ingredients = ingredients;
    }

    public static create(params: {
        tenantId: string;
        productCategoryId: string;
        productName: ProductName;
        productDescription: string | undefined;
        productSku: ProductSku;
        productImgUrl: string | undefined;
        productBasePrice: Money;
        profitMargin: number;
    }): Product {

        const product = new Product(
            ProductId.generate(),
            params.tenantId,
            params.productCategoryId,
            params.productName,
            params.productDescription,
            params.productSku,
            params.productImgUrl,
            params.productBasePrice,
            params.profitMargin,
            true,
            [],
        );

        product.registerEvent(
            new ProductCreatedEvent({
                productId: product.id.value,
                tenantId: product.tenantId,
                productCategoryId: product.productCategoryId,
                productName: product.productName.value,
                productDescription: product.productDescription,
                productSku: product.productSku.value,
                productImgUrl: product.productImgUrl,
                productBasePrice: product.productBasePrice.getAmount(),
                costCurrency: product.productBasePrice.currency,
                profitMargin: product.profitMargin,
                productStatus: product.productStatus,
            }),
        );

        return product;
    }

    public toPrimitives(): ProductPrimitives {
        return {
            id: this.id.value,
            tenantId: this.tenantId,
            productCategoryId: this.productCategoryId,
            productName: this.productName.value,
            productDescription: this.productDescription,
            productSku: this.productSku.value,
            productImgUrl: this.productImgUrl,
            productBasePrice: this.productBasePrice.getAmount(),
            costCurrency: this.productBasePrice.currency,
            profitMargin: this.profitMargin,
            productStatus: this.productStatus,
            ingredients: this.ingredients.map(
                (ingredient) => ingredient.toPrimitives(),
            ),
        };
    }

    public static fromPrimitives(
        primitives: ProductPrimitives,
    ): Product {
        return new Product(
            ProductId.create(primitives.id),
            primitives.tenantId,
            primitives.productCategoryId,
            ProductName.create(primitives.productName),
            primitives.productDescription,
            ProductSku.fromValue(primitives.productSku),
            primitives.productImgUrl,
            Money.of(primitives.productBasePrice, primitives.costCurrency),
            primitives.profitMargin,
            primitives.productStatus,
            primitives.ingredients.map(
                (ingredient) => RecipeIngredient.fromPrimitives(ingredient),
            ),
        );
    }

    public deactivate(): void {
        if (!this.productStatus) {
            throw new Error("El producto ya se encuentra desactivado.");
        }

        this.productStatus = false;
    }

    public activate(): void {
        if (this.productStatus) {
            throw new Error("El producto ya se encuentra activado.");
        }

        this.productStatus = true;
    }
    public update(params: {
        productCategoryId: string;
        productName: ProductName;
        productDescription: string | undefined;
        productImgUrl: string | undefined;
        productBasePrice: Money;
        profitMargin: number;
        productStatus: boolean;
        recipe?: RecipeParams[];
    }): void {
        this.productCategoryId = params.productCategoryId;
        this.productName = params.productName;
        this.productDescription = params.productDescription;
        this.productImgUrl = params.productImgUrl;
        this.productBasePrice = params.productBasePrice;
        this.profitMargin = params.profitMargin;
        this.productStatus = params.productStatus;

    }
    public addIngredient(params: {
        inventoryItemId: string;
        quantity: Quantity;
        isOptional: boolean;
    }): void {
        const exists = this.ingredients.some(
            (ingredient) =>
                ingredient.getInventoryItemId() === params.inventoryItemId,
        );

        if (exists) {
            throw new DuplicateIngredientException(params.inventoryItemId);
        }

        const ingredient = RecipeIngredient.create(params);

        this.ingredients.push(ingredient);
    }
    public changeIngredient(
        inventoryItemId: string,
        params: {
            quantity?: Quantity;
            isOptional?: boolean;
        },
    ): void {
        const ingredient = this.ingredients.find(
            (item) =>
                item.getInventoryItemId() === inventoryItemId,
        );

        if (!ingredient) {
            throw new IngredientNotInRecipeException(inventoryItemId);
        }

        ingredient.change(params);
    }
    public removeIngredient(
        inventoryItemId: string,
    ): void {
        const index = this.ingredients.findIndex(
            (ingredient) =>
                ingredient.getInventoryItemId() === inventoryItemId,
        );

        if (index === -1) {
            throw new IngredientNotInRecipeException(inventoryItemId);
        }

        this.ingredients.splice(index, 1);
    }
    public getIngredients(): RecipeIngredient[] {
        return [...this.ingredients];
    }
    public replaceRecipe(
        ingredients: Array<{
            inventoryItemId: string;
            quantity: Quantity;
            isOptional: boolean;
        }>,
    ): void {
        const inventoryItemIds = new Set<string>();

        for (const ingredient of ingredients) {
            if (inventoryItemIds.has(ingredient.inventoryItemId)) {
                throw new DuplicateIngredientException(
                    ingredient.inventoryItemId,
                );
            }

            inventoryItemIds.add(ingredient.inventoryItemId);
        }

        this.ingredients = ingredients.map(
            (ingredient) =>
                RecipeIngredient.create(ingredient),
        );
    }
}