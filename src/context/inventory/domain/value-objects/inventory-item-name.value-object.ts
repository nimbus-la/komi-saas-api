import { InvalidInventoryNameException } from "../exceptions/inventory-item.exceptions";

export class InventoryItemName {
    private static readonly MIN_LENGTH = 2;
    private static readonly MAX_LENGTH = 120;


    private constructor(public readonly value: string) { };


    public static create(raw: string): InventoryItemName {
        const value = raw.trim();

        if (value.length < this.MIN_LENGTH) {
            throw new InvalidInventoryNameException(`mínimo ${this.MIN_LENGTH} caracteres`);
        };

        if (value.length > this.MAX_LENGTH) {
            throw new InvalidInventoryNameException(`máximo ${this.MAX_LENGTH} caracteres`);
        };

        return new InventoryItemName(value);
    };


    /** Igualdad case-insensitive: "Tomate" y "tomate" son el mismo nombre. */
    public equals(other: InventoryItemName): boolean {
        return this.value.toLowerCase() === other.value.toLowerCase();
    };
};