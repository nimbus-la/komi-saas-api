import { InvalidProductNameException } from "../exceptions/product-exception";

export class ProductName {
    private static readonly MIN_LENGTH = 2;
    private static readonly MAX_LENGTH = 120;

    private constructor(
        public readonly value: string,
    ) { }

    public static create(raw: string): ProductName {
        const value = raw.trim();

        if (value.length < this.MIN_LENGTH) {
            throw new InvalidProductNameException(
                `mínimo ${this.MIN_LENGTH} caracteres`,
            );
        }

        if (value.length > this.MAX_LENGTH) {
            throw new InvalidProductNameException(
                `máximo ${this.MAX_LENGTH} caracteres`,
            );
        }

        return new ProductName(value);
    }

    public equals(other: ProductName): boolean {
        return this.value.toLowerCase() === other.value.toLowerCase();
    }
}