export class InventoryItemSku {
    private static readonly PREFIX: string = 'INV-';
    public readonly value: string;


    private constructor(value: string) {
        this.value = value;
    };


    /** Construye el SKU a partir del consecutivo de la secuencia. */
    public static fromNumber(number: number): InventoryItemSku {
        const padded = String(number).padStart(5, '0');
        return new InventoryItemSku(`${this.PREFIX}${padded}`);
    };


    /** Rehidrata desde la base */
    public static fromValue(value: string): InventoryItemSku {
        return new InventoryItemSku(value);
    };


    public equals(other: InventoryItemSku): boolean {
        return this.value === other.value;
    };
};