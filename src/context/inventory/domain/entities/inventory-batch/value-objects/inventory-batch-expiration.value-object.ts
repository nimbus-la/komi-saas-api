import { InvalidExpirationDateException } from "../../../exceptions/inventory-item.exceptions";


/**
 * Fecha de vencimiento de un lote. Solo aplica a items perecederos; para
 * no-perecederos el lote guarda null (la nulabilidad se maneja en el aggregate).
 */
export class InventoryBatchExpirationDate {
    private constructor(public readonly value: Date) { };


    public static create(raw: Date | string): InventoryBatchExpirationDate {
        const date = raw instanceof Date ? raw : new Date(raw);

        if (Number.isNaN(date.getTime())) {
            throw new InvalidExpirationDateException(`"${String(raw)}" no es una fecha válida`);
        };

        return new InventoryBatchExpirationDate(date);
    };


    public isBefore(other: Date): boolean {
        return this.value.getTime() < other.getTime();
    };
};