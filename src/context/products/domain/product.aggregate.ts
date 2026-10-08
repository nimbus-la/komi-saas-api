import { AggregateRoot, BasePriceError, EntityStatus, Money, Quantity, Status } from "@/shared";

import { ProductCreatedEvent } from "./events/product-created.event";
import { ProductId } from "./value-object/product-id.value-object";
import { ProductName } from "./value-object/product-name.value-object";
import { ProductSku } from "./value-object/product-sku.value-object";
import { ProductPrimitives } from "./interfaces/product-primitives";
import { DuplicateIngredientException } from "./recipe/exceptions/duplicate-ingredient.exception";
import { IngredientNotInRecipeException } from "./recipe/exceptions/ingredient-not-in-recipe.exception";
import { RecipeIngredient } from "./recipe/recipe-ingredient.entity";
import { RecipeParams } from "./interfaces/product-application";
import { ProductAlreadyActivatedException, ProductAlreadyDeactivatedException, ProductDeletedException } from "./exceptions/product-exception";
import { ProfitMargin } from "./value-object/profit-margin.value-object";
import { ProductDeletedEvent } from "./events/product-deleted.event";
import { ProfitabilityCalculator } from "./services/profitability-calculator";

export class Product extends AggregateRoot<ProductId> {
    private tenantId: string;
    private productCategoryId: string;
    private productName: ProductName;
    private productDescription: string | undefined;
    private productSku: ProductSku;
    private productImgUrl: string | undefined;
    private productBasePrice: Money;
    private productCost: Money;
    private profitMargin: ProfitMargin;
    private status: Status;
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
        productCost: Money,
        profitMargin: ProfitMargin,
        status: Status,
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
        this.productCost = productCost;
        this.profitMargin = profitMargin;
        this.status = status;
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
        productCost: Money;
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
            params.productCost,
            params.profitMargin,
            Status.active(),
            [],
            now,
            now,
        );

        product.ensurePricingIsConsistent();

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
                status: product.status.value,
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
            productCost: this.productCost.getAmount(),
            profitMargin: this.profitMargin.getValue(),
            status: this.status.value,
            ingredients: this.ingredients.map((ingredient) => ingredient.toPrimitives()),
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }


    public static fromPrimitives(primitives: ProductPrimitives): Product {
        return new Product(
            ProductId.create(primitives.id),
            primitives.tenantId,
            primitives.productCategoryId,
            ProductName.create(primitives.productName),
            primitives.productDescription,
            ProductSku.fromValue(primitives.productSku),
            primitives.productImgUrl,
            Money.of(primitives.productBasePrice, primitives.costCurrency),
            Money.of(primitives.productCost, primitives.costCurrency),
            ProfitMargin.create(primitives.profitMargin),
            Status.create(primitives.status),
            primitives.ingredients.map(
                (ingredient) => RecipeIngredient.fromPrimitives(ingredient),
            ),
            primitives.createdAt,
            primitives.updatedAt,
        );
    }


    public deactivate(): void {
        this.ensureNotDelete();

        if (this.status.is(EntityStatus.Inactive)) {
            throw new ProductAlreadyDeactivatedException();
        }

        this.status = this.status.transitionTo(EntityStatus.Inactive);
        this.touch();
    }


    public activate(): void {
        this.ensureNotDelete();

        if (this.status.isActive()) {
            throw new ProductAlreadyActivatedException();
        }

        this.status = this.status.transitionTo(EntityStatus.Active);
        this.touch();
    }


    /**
     * Cambia entre ACTIVE e INACTIVE con el valor que llega de la actualización.
     * Eliminar no pasa por aquí: tiene su propio método y su propio endpoint.
     */
    public changeStatus(next: EntityStatus): void {
        if (next === EntityStatus.Active) {
            this.activate();
            return;
        }

        if (next === EntityStatus.Inactive) {
            this.deactivate();
            return;
        }

        this.status.transitionTo(next);
    }


    public delete(deletedBy: string): void {
        this.ensureNotDelete();

        this.status = this.status.transitionTo(EntityStatus.Deleted);
        this.touch();

        this.registerEvent(
            new ProductDeletedEvent({
                tenantId: this.tenantId,
                productId: this.id.value,
                deletedBy
            })
        )
    }


    public getStatus(): EntityStatus {
        return this.status.value;
    }


    /**
     * El precio tiene que ser mayor que 0 y dejar exactamente el margen guardado
     * sobre el costo, comparados a dos decimales. Usa la misma calculadora que
     * POST /products/profitability, así el front puede pedir ahí el precio y
     * enviarlo sin que falle por centavos.
     */
    private ensurePricingIsConsistent(): void {
        if (this.productBasePrice.getAmount() === "0.00") {
            throw new BasePriceError("El precio del producto debe ser mayor que 0.");
        }

        ProfitabilityCalculator.calculate({
            cost: this.productCost.getAmount(),
            price: this.productBasePrice.getAmount(),
            targetMargin: this.profitMargin.getValue(),
        });
    }


    private ensureNotDelete(): void {
        if (this.status.isDeleted()) {
            throw new ProductDeletedException(this.id.value);
        }
    }


    public update(params: {
        productCategoryId: string;
        productName: ProductName;
        productDescription: string | undefined;
        productImgUrl: string | undefined;
        productBasePrice: Money;
        productCost: Money;
        profitMargin: ProfitMargin;
        recipe?: RecipeParams[];
    }): void {
        this.ensureNotDelete();
        
        this.productCategoryId = params.productCategoryId;
        this.productName = params.productName;
        this.productDescription = params.productDescription;
        this.productImgUrl = params.productImgUrl;
        this.productBasePrice = params.productBasePrice;
        this.productCost = params.productCost;
        this.profitMargin = params.profitMargin;
        this.ensurePricingIsConsistent();
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