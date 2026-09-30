import { DomainException } from "@/shared";


export class EmptyProductBranchConfigException extends DomainException {
    constructor() {
        super({
            code: "1421",
            detail: "La configuración de la sucursal debe indicar el precio, el estado o ambos.",
        });
    }
}


export class DuplicateBranchInProductConfigException extends DomainException {
    constructor(branchId: string) {
        super({
            code: "1423",
            detail: `La sucursal ${branchId} aparece más de una vez en la lista.`,
        });
    }
}


export class ProductBranchConfigNotFoundException extends DomainException {
    constructor(productId: string, branchId: string) {
        super({
            code: "1422",
            detail: `La sucursal ${branchId} no tiene una configuración para el producto ${productId}.`,
        });
    }
}
