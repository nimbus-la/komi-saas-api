import { DomainException } from "@/shared";

export class ProductNotFoundException extends DomainException {
    constructor(productId: string) {
        super({
            code: "2201",
            detail: `No se encontró el producto con id ${productId}.`,
        });
    }
}