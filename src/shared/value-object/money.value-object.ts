import Decimal from 'decimal.js';
import { DomainException } from '../exception/domain.exception';


/**
 * Monto/costo monetario inválido: formato no numérico, valor negativo,
 * moneda no ISO, o resultado inválido de una operación. Código 1002.
 */
export class InvalidMoneyError extends DomainException {
    constructor(detail: string) {
        super({ code: '1002', detail });
    };
};


/**
 * Se intenta operar dos Money de monedas distintas. Es una invariante interna
 * (indica un cruce indebido de monedas, no un dato del usuario). Código 1004.
 */
export class CurrencyMismatchError extends DomainException {
    constructor(a: string, b: string) {
        super({
            code: '1004',
            detail: `No se puede operar Money con monedas distintas: ${a} vs ${b}`
        });
    };
};



/**
 * Value Object que representa una cantidad de dinero (monto + moneda).
 * Inmutable y respaldado por Decimal para evitar errores de punto flotante:
 * toda operación aritmética devuelve una NUEVA instancia, nunca muta la actual.
 * El monto se redondea siempre a 2 decimales (ROUND_HALF_UP).
 */
export class Money {
    private readonly amount: Decimal;
    public readonly currency: string;



    /**
     * Constructor privado: solo se llama desde las fábricas (of/zero) o desde
     * las operaciones aritméticas internas. Redondea el monto a 2 decimales.
     * Privado para forzar la creación por of(), que valida las entradas.
     */
    private constructor(amount: Decimal, currency: string) {
        this.amount = amount.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
        this.currency = currency;
    };



    /**
     * Fábrica principal: crea un Money a partir de un monto (string) y una
     * moneda ISO de 3 letras (por defecto 'COP'). Valida que:
     *   - la moneda sea un código ISO de 3 letras,
     *   - el monto sea numérico y finito,
     *   - el monto no sea negativo.
     * Lanza InvalidMoneyError si algo falla. La moneda se normaliza a mayúsculas.
     */
    public static of(amount: string, currency = 'COP'): Money {
        const code = (currency ?? '').trim().toUpperCase();

        if (!/^[A-Z]{3}$/.test(code)) {
            throw new InvalidMoneyError(`Moneda inválida: "${currency}" (use ISO de 3 letras).`);
        };

        let decimal: Decimal;

        try {
            decimal = new Decimal(amount);

        } catch {
            throw new InvalidMoneyError(`Monto inválido: "${amount}".`);
        };

        if (!decimal.isFinite()) {
            throw new InvalidMoneyError(`Monto inválido: "${amount}".`);
        };

        if (decimal.isNegative()) {
            throw new InvalidMoneyError(`El monto no puede ser negativo: "${amount}".`);
        };

        return new Money(decimal, code);
    };



    /**
     * Fábrica de conveniencia: un Money en cero para la moneda dada (por
     * defecto 'COP'). Útil como acumulador inicial en sumas (reduce).
     */
    public static zero(currency = 'COP') {
        return Money.of('0', currency);
    };



    // ---- Aritmética (devuelve nuevas instancias: inmutables) ----

    /**
     * Suma otro Money y devuelve un nuevo Money con el resultado.
     * Exige que ambos tengan la misma moneda (si no, CurrencyMismatchError).
     */
    public add(other: Money): Money {
        this.assertSameCurrency(other);
        return new Money(this.amount.plus(other.amount), this.currency);
    };



    /**
     * Resta otro Money y devuelve un nuevo Money con el resultado.
     * Exige misma moneda. Lanza InvalidMoneyError si el resultado sería
     * negativo (no se admiten montos negativos en este dominio).
     */
    public subtract(other: Money): Money {
        this.assertSameCurrency(other);
        const result = this.amount.minus(other.amount);

        if (result.isNegative()) {
            throw new InvalidMoneyError('La resta resultaría en un monto negativo.');
        };

        return new Money(result, this.currency);
    };



    /**
     * Multiplica el monto por un factor (number o string) y devuelve un nuevo
     * Money. Acepta string para no perder precisión (ej. cantidades decimales).
     * Lanza InvalidMoneyError si el factor es negativo.
     * Uso típico: costo unitario × cantidad = costo total.
     */
    public multiply(factor: number | string): Money {
        const newFactor = new Decimal(factor);

        if (newFactor.isNegative()) {
            throw new InvalidMoneyError('El multiplicador no puede ser negativo.');
        };

        return new Money(this.amount.times(newFactor), this.currency);
    };



    /**
     * Divide el monto por un divisor (number o string) y devuelve un nuevo
     * Money. Lanza InvalidMoneyError si el divisor es cero o negativo.
     * Uso típico: costo total ÷ cantidad recibida = costo unitario.
     */
    public divide(divisor: number | string): Money {
        const newDivisor = new Decimal(divisor);

        if (newDivisor.isNegative() || newDivisor.isZero()) {
            throw new InvalidMoneyError('El divisor debe ser mayor a cero.');
        };

        return new Money(this.amount.dividedBy(newDivisor), this.currency);
    };



    // ---- Comparación ----

    /**
     * Igualdad por valor: dos Money son iguales si tienen el mismo monto Y la
     * misma moneda. No compara por referencia (son value objects).
     */
    public equals(other: Money): boolean {
        return (
            other instanceof Money &&
            this.amount.equals(other.amount) &&
            this.currency === other.currency
        );
    };



    // ---- Salida ----

    /**
     * Devuelve el monto como string con exactamente 2 decimales (ej. "10450.00").
     * String para no reintroducir errores de punto flotante al serializar.
     */
    public getAmount(): string {
        return this.amount.toFixed(2); // "10450.00", string exacto
    };



    /** Representación legible para logs/depuración (ej. "COP. 10450.00"). */
    public toString(): string {
        return `${this.currency}. ${this.getAmount()}`;
    };



    /**
     * Serializa a un objeto plano { amount, currency } para persistencia o
     * transporte. Inverso conceptual de Money.of(amount, currency).
     */
    public toPrimitives(): { amount: string; currency: string } {
        return { amount: this.getAmount(), currency: this.currency };
    };



    /**
     * Guarda interna: verifica que dos Money compartan moneda antes de operar.
     * Si no coinciden, lanza CurrencyMismatchError. La usan add y subtract.
     */
    private assertSameCurrency(other: Money): void {
        if (this.currency !== other.currency) {
            throw new CurrencyMismatchError(this.currency, other.currency);
        };
    };
};