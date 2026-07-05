import { MeasurementUnit } from "../common/constants.common";
import { InvalidInventoryUnitException } from "../exceptions/inventory-item.exceptions";


/** Unidad de medida del item, restringida a un conjunto controlado. */
export class InventoryItemUnit {
    private constructor(public readonly value: MeasurementUnit) { };

    public static create(raw: string): InventoryItemUnit {
        const normalized = raw.trim().toUpperCase();

        if (!Object.values(MeasurementUnit).includes(normalized as MeasurementUnit)) {
            throw new InvalidInventoryUnitException(raw);
        };

        return new InventoryItemUnit(normalized as MeasurementUnit);
    };

    public equals(other: InventoryItemUnit): boolean {
        return this.value === other.value;
    };
};
