import Decimal from 'decimal.js';


export class InvalidQuantityError extends Error {
    constructor(message: string) {
        super(message);
    };
};


/**
 * Cantidad de inventario. Inmutable y respaldada por Decimal para evitar
 * errores de punto flotante. La UNIDAD de medida no vive aquí: la define el
 * item al que pertenece la cantidad (todas las cantidades de un lote comparten
 * la unidad del item).
 */
export class Quantity {
    private static readonly SCALE = 3;
    private readonly value: Decimal;


    private constructor(value: Decimal) {
        this.value = value.toDecimalPlaces(Quantity.SCALE, Decimal.ROUND_HALF_UP);
    };


    public static of(amount: string): Quantity {
        let decimal: Decimal;

        try {
            decimal = new Decimal(amount);
        } catch {
            throw new InvalidQuantityError(`Cantidad inválida: "${amount}".`);
        };

        if (!decimal.isFinite()) {
            throw new InvalidQuantityError(`Cantidad inválida: "${amount}".`);
        };

        if (decimal.isNegative()) {
            throw new InvalidQuantityError(`La cantidad no puede ser negativa: "${amount}".`);
        };

        return new Quantity(decimal);
    };


    public static zero(): Quantity {
        return new Quantity(new Decimal(0));
    };


    public add(other: Quantity): Quantity {
        return new Quantity(this.value.plus(other.value));
    };


    public subtract(other: Quantity): Quantity {
        const result = this.value.minus(other.value);

        if (result.isNegative()) {
            throw new InvalidQuantityError('La resta resultaría en una cantidad negativa.');
        };

        return new Quantity(result);
    };


    public isZero(): boolean {
        return this.value.isZero();
    };


    public isGreaterThan(other: Quantity): boolean {
        return this.value.greaterThan(other.value);
    };


    public getValue(): string {
        return this.value.toString();
    };


    public toString(): string {
        return this.value.toString();
    };
};