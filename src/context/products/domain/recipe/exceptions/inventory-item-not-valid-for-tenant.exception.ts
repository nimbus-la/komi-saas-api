import { DomainException } from "@/shared";

export class InventoryItemNotValidForTenantException extends DomainException {
    constructor(
        inventoryItemId: string,
        tenantId: string,
    ) {
        super({
            code: "1470",
            detail: `El ingrediente de inventario con id ${inventoryItemId} no existe o no pertenece al tenant ${tenantId}.`,
        });
    }
}