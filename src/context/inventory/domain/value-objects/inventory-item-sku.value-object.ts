/**
 * Value Object del SKU de un item de inventario.
 *
 * El SKU es un código legible y único con formato "INV-0001". El número
 * consecutivo lo entrega una secuencia de Postgres (ver InventoryItemSkuSequence);
 * este VO solo se encarga de darle formato y de encapsular el valor.
 *
 * Es inmutable: se asigna al crear el item y no cambia.
 */
export class InventoryItemSku {
    private static readonly PREFIX: string = 'INV-';
    private static readonly PADDING: number = 4;

    public readonly value: string;


    private constructor(value: string) {
        this.value = value;
    };


    /**
     * Construye el SKU a partir del número consecutivo de la secuencia.
     * Rellena con ceros a la izquierda hasta 4 dígitos (1 -> "INV-0001").
     * Si el número supera 9999, no se recorta: sigue creciendo ("INV-10000").
     */
    public static fromNumber(sequence: number): InventoryItemSku {
        const padded = String(sequence).padStart(InventoryItemSku.PADDING, '0');

        return new InventoryItemSku(`${InventoryItemSku.PREFIX}${padded}`);
    };


    /**
     * Rehidrata el SKU desde el valor ya formateado guardado en la base
     * (ej. "INV-0042"), sin volver a calcular el formato.
     */
    public static fromValue(value: string): InventoryItemSku {
        return new InventoryItemSku(value);
    };


    /** Igualdad por valor: dos SKU son iguales si su string coincide. */
    public equals(other: InventoryItemSku): boolean {
        return this.value === other.value;
    };
};