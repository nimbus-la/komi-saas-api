import { DomainException } from "@/shared";

export class ProductNotFoundException extends DomainException {
    constructor(productId: string) {
        super({
            code: "2201",
            detail: `No se encontró el producto con id ${productId}.`,
        });
    }
}

export class InvalidProductNameException extends DomainException {
    constructor(reason: string) {
        super({
            code: "2001",
            detail: `Nombre de producto inválido: ${reason}.`,
        });
    }
}

export class ProductNameAlreadyExistsException extends DomainException {
    constructor(name: string) {
        super({
            code: "2200",
            detail: `El producto "${name}" ya se encuentra registrado.`,
        });
    }
}
