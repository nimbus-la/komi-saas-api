import {
    CategoryNameTooLongException,
    CategoryNameTooShortException,
} from "../exceptions/product-category.exception";

export class CategoryName {
    public static readonly MIN_LENGTH = 2;
    public static readonly MAX_LENGTH = 120;

    private constructor(
        public readonly value: string,
    ) { }

    public static create(raw: string): CategoryName {
        const value = raw.trim();

        if (value.length < CategoryName.MIN_LENGTH) {
            throw new CategoryNameTooShortException(CategoryName.MIN_LENGTH);
        }

        if (value.length > CategoryName.MAX_LENGTH) {
            throw new CategoryNameTooLongException(CategoryName.MAX_LENGTH);
        }

        return new CategoryName(value);
    }

    /** Igualdad de negocio: dos categorías no pueden diferenciarse sólo por mayúsculas. */
    public equals(other: CategoryName): boolean {
        return this.value.toLowerCase() === other.value.toLowerCase();
    }
}
