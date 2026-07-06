export class ProductSku {
    private static readonly PREFIX = "PROD-";
    private static readonly PADDING = 4;

    public readonly value: string;

    private constructor(value: string) {
        this.value = value;
    }

    public static fromNumber(sequence: number): ProductSku {
        const padded = String(sequence).padStart(
            ProductSku.PADDING,
            "0",
        );

        return new ProductSku(`${ProductSku.PREFIX}${padded}`);
    }

    public static fromValue(value: string): ProductSku {
        return new ProductSku(value);
    }

    public equals(other: ProductSku): boolean {
        return this.value === other.value;
    }
}