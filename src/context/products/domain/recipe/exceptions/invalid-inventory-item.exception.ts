import { DomainException } from "@/shared";

export class InvalidInventoryItemException extends DomainException {
    constructor(inventoryItemId: string) {
        super({
            code: "1469",
            detail: `El inventoryItemId "${inventoryItemId}" no es válido.`,
        });
    }
}