import { AggregateRoot } from "@/shared";

import { RecipeItemPrimitives } from "./types";
import { RecipeItemId } from "./value-object/recipe-item-id.value-object";

export class RecipeItem extends AggregateRoot<RecipeItemId> {
    private productId: string;
    private inventoryItemId: string;
    private quantity: string;
    private unit: string;
    private lineCost: string;
    private isOptional: boolean;

    private constructor(
        id: RecipeItemId,
        productId: string,
        inventoryItemId: string,
        quantity: string,
        unit: string,
        lineCost: string,
        isOptional: boolean,
    ) {
        super(id);

        this.productId = productId;
        this.inventoryItemId = inventoryItemId;
        this.quantity = quantity;
        this.unit = unit;
        this.lineCost = lineCost;
        this.isOptional = isOptional;
    }

    public static create(params: {
        productId: string;
        inventoryItemId: string;
        quantity: string;
        unit: string;
        lineCost: string;
        isOptional: boolean;
    }): RecipeItem {
        return new RecipeItem(
            RecipeItemId.generate(),
            params.productId,
            params.inventoryItemId,
            params.quantity,
            params.unit,
            params.lineCost,
            params.isOptional,
        );
    }

    public static fromPrimitives(
        primitives: RecipeItemPrimitives,
    ): RecipeItem {
        return new RecipeItem(
            RecipeItemId.create(primitives.id),
            primitives.productId,
            primitives.inventoryItemId,
            primitives.quantity,
            primitives.unit,
            primitives.lineCost,
            primitives.isOptional,
        );
    }

    public toPrimitives(): RecipeItemPrimitives {
        return {
            id: this.id.value,
            productId: this.productId,
            inventoryItemId: this.inventoryItemId,
            quantity: this.quantity,
            unit: this.unit,
            lineCost: this.lineCost,
            isOptional: this.isOptional,
        };
    }

    public update(params: {
        productId: string;
        inventoryItemId: string;
        quantity: string;
        unit: string;
        lineCost: string;
        isOptional: boolean;
    }): void {
        this.productId = params.productId;
        this.inventoryItemId = params.inventoryItemId;
        this.quantity = params.quantity;
        this.unit = params.unit;
        this.lineCost = params.lineCost;
        this.isOptional = params.isOptional;
    }
}