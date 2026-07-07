import { DomainException } from "@/shared";

export class InvalidProductSkuException extends DomainException {
    constructor(reason: string) {
        super({
            code: "2002",
            detail: `SKU del producto inválido: ${reason}.`,
        });
    }
}

export class ProductSkuAlreadyExistsException extends DomainException {
    constructor(sku: string) {
        super({
            code: "2201",
            detail: `El SKU "${sku}" ya se encuentra registrado.`,
        });
    }
}

export class ProductSku {
    private static readonly MIN_LENGTH = 2;
    private static readonly MAX_LENGTH = 50;

    private constructor(
        public readonly value: string,
    ) { }

    public static create(raw: string): ProductSku {
        const value = raw.trim().toUpperCase();

        if (value.length < this.MIN_LENGTH) {
            throw new InvalidProductSkuException(
                `mínimo ${this.MIN_LENGTH} caracteres`,
            );
        }

        if (value.length > this.MAX_LENGTH) {
            throw new InvalidProductSkuException(
                `máximo ${this.MAX_LENGTH} caracteres`,
            );
        }

        return new ProductSku(value);
    }

    public equals(other: ProductSku): boolean {
        return this.value === other.value;
    }
}