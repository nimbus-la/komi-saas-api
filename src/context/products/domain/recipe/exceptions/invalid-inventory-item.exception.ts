import { DomainException } from "@/shared";

export class InvalidInventoryItemException extends DomainException {
    constructor(inventoryItemId: string) {
        super({
            code: "1403",
            detail: `El inventoryItemId "${inventoryItemId}" no es válido.`,
        });
    }
}