import Decimal from "decimal.js";

import { InvalidProfitMarginException } from "../exceptions/product-exception";

export class ProfitMargin {
    private readonly value: Decimal;

    private constructor(value: Decimal) {
        this.value = value.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    }

    public static create(value: string): ProfitMargin {
        let decimal: Decimal;

        try {
            decimal = new Decimal(value);
        } catch {
            throw new InvalidProfitMarginException();
        }

        if (!decimal.isFinite()) {
            throw new InvalidProfitMarginException();
        }

        if (decimal.isZero() || decimal.isNegative()) {
            throw new InvalidProfitMarginException();
        }

        return new ProfitMargin(decimal);
    }

    public getValue(): string {
        return this.value.toFixed(2);
    }

    public equals(other: ProfitMargin): boolean {
        return (
            other instanceof ProfitMargin &&
            this.value.equals(other.value)
        );
    }

    public toString(): string {
        return this.getValue();
    }

    public toPrimitives(): string {
        return this.getValue();
    }
}