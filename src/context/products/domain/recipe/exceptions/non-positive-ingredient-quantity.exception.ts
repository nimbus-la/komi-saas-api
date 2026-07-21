import { DomainException } from "@/shared";

export class NonPositiveIngredientQuantityException extends DomainException {
    constructor() {
        super({
            code: "1400",
            detail: "La cantidad del ingrediente debe ser mayor que cero.",
        });
    }
}