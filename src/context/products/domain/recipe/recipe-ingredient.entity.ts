import { Entity, Quantity } from "@/shared";

import { RecipeIngredientId } from "./recipe-ingredient-id";
import { RecipeIngredientPrimitives } from "./recipe-ingredient-primitives";
import { NonPositiveIngredientQuantityException } from "./exceptions/non-positive-ingredient-quantity.exception";

export class RecipeIngredient extends Entity<RecipeIngredientId> {
    private readonly inventoryItemId: string;
    private quantity: Quantity;
    private isOptional: boolean;

    private constructor(
        id: RecipeIngredientId,
        inventoryItemId: string,
        quantity: Quantity,
        isOptional: boolean,
    ) {
        super(id);

        this.inventoryItemId = inventoryItemId;
        this.quantity = quantity;
        this.isOptional = isOptional;
    }

    public static create(params: {
        inventoryItemId: string;
        quantity: Quantity;
        isOptional: boolean;
    }): RecipeIngredient {
        if (params.quantity.isZero()) {
            throw new NonPositiveIngredientQuantityException();
        }

        return new RecipeIngredient(
            RecipeIngredientId.generate(),
            params.inventoryItemId,
            params.quantity,
            params.isOptional,
        );
    }

    public change(params: {
        quantity?: Quantity;
        isOptional?: boolean;
    }): void {
        if (params.quantity !== undefined) {
            if (params.quantity.isZero()) {
                throw new NonPositiveIngredientQuantityException();
            }

            this.quantity = params.quantity;
        }

        if (params.isOptional !== undefined) {
            this.isOptional = params.isOptional;
        }
    }

    public getInventoryItemId(): string {
        return this.inventoryItemId;
    }

    public getQuantity(): Quantity {
        return this.quantity;
    }

    public getIsOptional(): boolean {
        return this.isOptional;
    }

    public toPrimitives(): RecipeIngredientPrimitives {
        return {
            id: this.id.value,
            inventoryItemId: this.inventoryItemId,
            quantity: this.quantity.getValue(),
            isOptional: this.isOptional,
        };
    }

    public static fromPrimitives(
        primitives: RecipeIngredientPrimitives,
    ): RecipeIngredient {
        return new RecipeIngredient(
            RecipeIngredientId.create(primitives.id),
            primitives.inventoryItemId,
            Quantity.of(primitives.quantity),
            primitives.isOptional,
        );
    }
}