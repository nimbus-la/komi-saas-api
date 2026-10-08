import Decimal from "decimal.js";

import {
    InvalidTargetMarginException,
    PriceMarginMismatchException,
} from "../../../domain/exceptions/product-exception";
import { ProfitabilityInput, ProfitabilityResult } from "../../../domain/interfaces/profitability";

const CIEN = new Decimal(100);

/**
 * Fórmulas de rentabilidad de un producto a partir de su costo.
 * El margen se mide sobre el precio de venta. Los cálculos se hacen con
 * precisión completa y solo se redondea a dos decimales al devolver.
 */
export class ProfitabilityCalculator {

    /**
     * Decide qué calcular según lo que llegó: con precio se saca el margen real,
     * con margen se saca el precio, con ambos se verifica que cuadren y sin
     * ninguno solo se devuelve el costo.
     */
    public static calculate(input: ProfitabilityInput): ProfitabilityResult {
        const costo = new Decimal(input.cost);
        const { price, targetMargin } = input;

        if (targetMargin !== undefined) {
            this.assertValidMargin(targetMargin);
        }

        if (price !== undefined) {
            if (targetMargin !== undefined) {
                this.assertPriceMatchesMargin(costo, new Decimal(price), new Decimal(targetMargin));
            }

            return this.fromPrice(costo, new Decimal(price));
        }

        if (targetMargin !== undefined) {
            return this.fromPrice(costo, this.priceForMargin(costo, new Decimal(targetMargin)));
        }

        return {
            cost: this.round(costo),
            price: null,
            grossProfit: null,
            margin: null,
            foodCost: null,
            markup: null,
        };
    }

    /** Arma todos los indicadores una vez se conoce el precio de venta. */
    private static fromPrice(costo: Decimal, precio: Decimal): ProfitabilityResult {
        const ganancia = precio.minus(costo);

        return {
            cost: this.round(costo),
            price: this.round(precio),
            grossProfit: this.round(ganancia),
            margin: this.round(this.marginOf(costo, precio)),
            foodCost: precio.isZero() ? null : this.round(costo.div(precio).times(CIEN)),
            // Sin costo el markup sería una división por cero.
            markup: costo.isZero() ? null : this.round(ganancia.div(costo).times(CIEN)),
        };
    }

    /** Precio necesario para que la ganancia sea el margen indicado del precio. */
    private static priceForMargin(costo: Decimal, margen: Decimal): Decimal {
        return costo.div(new Decimal(1).minus(margen.div(CIEN)));
    }

    /** Margen real sobre el precio. Con precio cero no hay margen que medir. */
    private static marginOf(costo: Decimal, precio: Decimal): Decimal {
        return precio.isZero() ? new Decimal(0) : precio.minus(costo).div(precio).times(CIEN);
    }

    /**
     * Compara el margen real del precio con el objetivo, los dos redondeados a
     * dos decimales, para no rechazar diferencias de centavos.
     */
    private static assertPriceMatchesMargin(costo: Decimal, precio: Decimal, margen: Decimal): void {
        const margenReal = this.round(this.marginOf(costo, precio));

        if (margenReal !== this.round(margen)) {
            throw new PriceMarginMismatchException({
                margenObjetivo: this.round(margen),
                margenReal,
                precioEsperado: this.round(this.priceForMargin(costo, margen)),
            });
        }
    }

    /** El margen tiene que estar entre 0 y 100, sin incluir el 100. */
    private static assertValidMargin(margen: string): void {
        const valor = new Decimal(margen);

        if (valor.isNegative() || valor.greaterThanOrEqualTo(CIEN)) {
            throw new InvalidTargetMarginException();
        }
    }

    private static round(valor: Decimal): string {
        return valor.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2);
    }
}
