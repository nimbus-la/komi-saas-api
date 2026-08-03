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
import { ProductAlreadyActivatedException, ProductAlreadyDeactivatedException } from "./exceptions/product-exception";
import { ProfitMargin } from "./value-object/profit-margin.value-object";

export class Product extends AggregateRoot<ProductId> {
    private tenantId: string;
    private productCategoryId: string;
    private productName: ProductName;
    private productDescription: string | undefined;
    private productSku: ProductSku;
    private productImgUrl: string | undefined;

    private productBasePrice: Money;
    private profitMargin: ProfitMargin;
    private productStatus: boolean;
    private ingredients: RecipeIngredient[];
    private readonly createdAt: Date;
    private updatedAt: Date;

    private constructor(
        id: ProductId,
        tenantId: string,
        productCategoryId: string,
        productName: ProductName,
        productDescription: string | undefined,
        productSku: ProductSku,
        productImgUrl: string | undefined,
        productBasePrice: Money,
        profitMargin: ProfitMargin,
        productStatus: boolean,
        ingredients: RecipeIngredient[],
        createdAt: Date,
        updatedAt: Date,
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
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static create(params: {
        tenantId: string;
        productCategoryId: string;
        productName: ProductName;
        productDescription: string | undefined;
        productSku: ProductSku;
        productImgUrl: string | undefined;
        productBasePrice: Money;
        profitMargin: ProfitMargin;
    }): Product {

        const now = new Date();

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
            now,
            now,
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

    private touch(date: Date = new Date()): void {
        this.updatedAt = date;
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
            profitMargin: this.profitMargin.getValue(),
            productStatus: this.productStatus,
            ingredients: this.ingredients.map(
                (ingredient) => ingredient.toPrimitives(),
            ),
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
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
            ProfitMargin.create(primitives.profitMargin),
            primitives.productStatus,
            primitives.ingredients.map(
                (ingredient) => RecipeIngredient.fromPrimitives(ingredient),
            ),
            primitives.createdAt,
            primitives.updatedAt,
        );
    }

    public deactivate(): void {
        if (!this.productStatus) {
            throw new ProductAlreadyDeactivatedException();
        }
        this.productStatus = false;
        this.touch();
    }

    public activate(): void {
        if (this.productStatus) {
            throw new ProductAlreadyActivatedException();
        }
        this.productStatus = true;
        this.touch();
    }

    public update(params: {
        productCategoryId: string;
        productName: ProductName;
        productDescription: string | undefined;
        productImgUrl: string | undefined;
        productBasePrice: Money;
        profitMargin: ProfitMargin;
        recipe?: RecipeParams[];
    }): void {
        this.productCategoryId = params.productCategoryId;
        this.productName = params.productName;
        this.productDescription = params.productDescription;
        this.productImgUrl = params.productImgUrl;
        this.productBasePrice = params.productBasePrice;
        this.profitMargin = params.profitMargin;
        this.touch();
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
        this.touch();
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
        this.touch();
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
        this.touch();
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

        const incomingIds = new Set<string>();

        // 1. Validar duplicados del request
        for (const ingredient of ingredients) {

            if (incomingIds.has(ingredient.inventoryItemId)) {
                throw new DuplicateIngredientException(
                    ingredient.inventoryItemId,
                );
            }

            incomingIds.add(ingredient.inventoryItemId);
        }


        // 2. Actualizar ingredientes existentes
        for (const currentIngredient of [...this.ingredients]) {

            const incomingIngredient =
                ingredients.find(
                    (ingredient) =>
                        ingredient.inventoryItemId ===
                        currentIngredient.getInventoryItemId(),
                );


            // Existe en la receta y sigue viniendo
            if (incomingIngredient) {

                currentIngredient.change({
                    quantity: incomingIngredient.quantity,
                    isOptional: incomingIngredient.isOptional,
                });

            } else {

                // Existía pero ya no viene → eliminar
                this.removeIngredient(
                    currentIngredient.getInventoryItemId(),
                );
            }
        }


        // 3. Agregar ingredientes nuevos
        for (const ingredient of ingredients) {

            const exists =
                this.ingredients.some(
                    (item) =>
                        item.getInventoryItemId() ===
                        ingredient.inventoryItemId,
                );


            if (!exists) {
                this.addIngredient(ingredient);
            }
        }
        this.touch();
    }
}