export class CategoryName {
    private static readonly MIN_LENGTH = 2;
    private static readonly MAX_LENGTH = 120;

    private constructor(
        public readonly value: string,
    ) { }

    public static create(raw: string): CategoryName {
        const value = raw.trim();

        if (value.length < this.MIN_LENGTH) {
            throw new Error(
                `El nombre de la categoría debe tener mínimo ${this.MIN_LENGTH} caracteres.`,
            );
        }

        if (value.length > this.MAX_LENGTH) {
            throw new Error(
                `El nombre de la categoría debe tener máximo ${this.MAX_LENGTH} caracteres.`,
            );
        }

        return new CategoryName(value);
    }

    public equals(other: CategoryName): boolean {
        return this.value.toLowerCase() === other.value.toLowerCase();
    }
}