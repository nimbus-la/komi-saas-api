import { DomainException } from "@/shared";

export class ProductNotFoundException extends DomainException {
    constructor(productId: string) {
        super({
            code: "1400",
            detail: `No se encontró el producto con id ${productId}.`,
        });
    }
}

export class InvalidProductNameException extends DomainException {
    constructor(reason: string) {
        super({
            code: "1401",
            detail: `Nombre de producto inválido: ${reason}.`,
        });
    }
}

export class ProductNameAlreadyExistsException extends DomainException {
    constructor(name: string) {
        super({
            code: "1402",
            detail: `El producto "${name}" ya se encuentra registrado.`,
        });
    }
}

export class SkuSequenceNotGeneratedException extends DomainException {
    constructor() {
        super({
            code: "1403",
            detail: "No se pudo obtener el siguiente valor de la secuencia de SKU.",
        });
    }
}

export class TenantNotFoundException extends DomainException {
    constructor(tenantId: string) {
        super({
            code: "1205",
            detail: `No se encontró el tenant con id ${tenantId}.`,
        });
    }
}

export class ProductAlreadyDeactivatedException extends DomainException {
    constructor() {
        super({
            code: "1404",
            detail: "El producto ya se encuentra desactivado.",
        });
    }
}

export class ProductAlreadyActivatedException extends DomainException {
    constructor() {
        super({
            code: "1405",
            detail: "El producto ya se encuentra activado.",
        });
    }
}


export class InventoryItemNotValidForTenantException extends DomainException {

    constructor(
        inventoryItemId: string,
        tenantId: string,
    ) {
        super({
            code: "1406",
            detail:
                `El item de inventario ${inventoryItemId} no pertenece al tenant ${tenantId}.`,
        });
    }
}
export class InvalidProfitMarginException extends DomainException {
    constructor() {
        super({
            code: "1407",
            detail:
                `El margen de beneficio no puede ser menor que 0.`,
        });
    }
}