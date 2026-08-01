import { DomainException } from "@/shared";

export class DuplicateIngredientException extends DomainException {
    constructor(inventoryItemId: string) {
        super({
            code: "1467",
            detail: `El ingrediente con inventoryItemId "${inventoryItemId}" ya se encuentra agregado a la receta.`,
        });
    }
}