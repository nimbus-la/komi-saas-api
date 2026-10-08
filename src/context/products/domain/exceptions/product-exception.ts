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
            detail: "El producto ya se encuentra inactivo.",
        });
    }
}

export class ProductAlreadyActivatedException extends DomainException {
    constructor() {
        super({
            code: "1405",
            detail: "El producto ya se encuentra activo.",
        });
    }
}


/**
 * El producto está en DELETED. Normalmente ni se llega a cargar, porque el
 * repositorio no devuelve eliminados; esto protege al agregado si alguien lo
 * construye igual.
 */
export class ProductDeletedException extends DomainException {
    constructor(productId: string) {
        super({
            code: "1406",
            detail: `El producto ${productId} fue eliminado y no se puede modificar.`,
        });
    }
}


export class InvalidProfitMarginException extends DomainException {
    constructor() {
        super({
            code: "1407",
            detail:
                `El margen de beneficio debe ser mayor que 0 y menor que 100.`,
        });
    }
}

export class ProductNotModifiedException extends DomainException {
    constructor() {
        super({
            code: "1408",
            detail: "No se encontraron cambios para actualizar el producto.",
        });
    }
}

export class TenantIdRequiredForSearchException extends DomainException {
    constructor() {
        super({
            code: "1409",
            detail: "El negocio es obligatorio para buscar productos.",
        });
    }
}

/**
 * La sucursal enviada para evaluar el stock de los insumos no existe o es de
 * otro negocio. Ambos casos responden igual para no revelar sucursales ajenas.
 */
export class BranchNotFoundForProductsException extends DomainException {
    constructor(branchId: string) {
        super({
            code: "1410",
            detail: `La sucursal ${branchId} no existe o no está disponible.`,
        });
    }
}

/** El precio de venta enviado no da el margen objetivo que también se envió. */
export class PriceMarginMismatchException extends DomainException {
    constructor(params: {
        margenObjetivo: string;
        margenReal: string;
        precioEsperado: string;
    }) {
        super({
            code: "1411",
            detail:
                `El precio de venta da un margen de ${params.margenReal} y no de ${params.margenObjetivo}. ` +
                `Para ese margen el precio debería ser ${params.precioEsperado}.`,
        });
    }
}

/** Un margen de 100 o más no tiene precio posible, y uno negativo no es objetivo. */
export class InvalidTargetMarginException extends DomainException {
    constructor() {
        super({
            code: "1412",
            detail: "El margen objetivo debe ser mayor o igual a 0 y menor que 100.",
        });
    }
}

/**
 * El insumo no tiene lotes con existencias y por eso no hay costo con qué
 * calcular. Tomarlo como cero daría una rentabilidad falsa.
 */
export class IngredientWithoutCostException extends DomainException {
    constructor(inventoryItemId: string) {
        super({
            code: "1413",
            detail: `El insumo ${inventoryItemId} no tiene costo porque no tiene existencias registradas.`,
        });
    }
}
