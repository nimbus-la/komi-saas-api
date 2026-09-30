import { DomainException } from "@/shared";


export class InvalidBranchPriceException extends DomainException {
    constructor() {
        super({
            code: "1411",
            detail: "El precio del producto en la sucursal debe ser mayor que 0.",
        });
    }
}


export class EmptyProductBranchConfigException extends DomainException {
    constructor() {
        super({
            code: "1412",
            detail: "La configuración de la sucursal debe indicar el precio, el estado o ambos.",
        });
    }
}
