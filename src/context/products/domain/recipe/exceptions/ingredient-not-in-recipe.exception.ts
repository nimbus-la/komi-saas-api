import { DomainException } from "@/shared";

export class IngredientNotInRecipeException extends DomainException {
    constructor(inventoryItemId: string) {
        super({
            code: "1468",
            detail: `El ingrediente con inventoryItemId "${inventoryItemId}" no se encuentra en la receta.`,
        });
    }
}