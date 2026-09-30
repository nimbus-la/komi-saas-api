import { DomainException } from "@/shared";

export class InventoryItemNotValidForTenantException extends DomainException {
    constructor(
        inventoryItemId: string,
        tenantId: string,
    ) {
        super({
            code: "1463",
            detail: `El ingrediente de inventario ${inventoryItemId} no existe o no pertenece al negocio ${tenantId}.`,
        });
    }
}