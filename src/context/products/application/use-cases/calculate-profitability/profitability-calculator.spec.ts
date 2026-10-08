import {
    InvalidTargetMarginException,
    PriceMarginMismatchException,
} from '../../../domain/exceptions/product-exception';
import { ProfitabilityCalculator } from './profitability-calculator';

describe('ProfitabilityCalculator', () => {

    it('con solo el precio calcula el margen real sobre el precio', () => {
        expect(ProfitabilityCalculator.calculate({ costoReceta: '4000', precioVenta: '10000' })).toEqual({
            costoReceta: '4000.00',
            precioVenta: '10000.00',
            gananciaBruta: '6000.00',
            margen: '60.00',
            foodCost: '40.00',
            markup: '150.00',
        });
    });

    it('con solo el margen calcula el precio que lo alcanza', () => {
        expect(ProfitabilityCalculator.calculate({ costoReceta: '4000', margenObjetivo: '60' })).toEqual({
            costoReceta: '4000.00',
            precioVenta: '10000.00',
            gananciaBruta: '6000.00',
            margen: '60.00',
            foodCost: '40.00',
            markup: '150.00',
        });
    });

    it('con precio y margen que cuadran devuelve el cálculo', () => {
        const result = ProfitabilityCalculator.calculate({
            costoReceta: '4000',
            precioVenta: '10000',
            margenObjetivo: '60',
        });

        expect(result.margen).toBe('60.00');
    });

    it('con precio y margen que no cuadran lanza la excepción', () => {
        expect(() => ProfitabilityCalculator.calculate({
            costoReceta: '4000',
            precioVenta: '9000',
            margenObjetivo: '60',
        })).toThrow(PriceMarginMismatchException);
    });

    it('sin precio ni margen devuelve solo el costo', () => {
        expect(ProfitabilityCalculator.calculate({ costoReceta: '4000.456' })).toEqual({
            costoReceta: '4000.46',
            precioVenta: null,
            gananciaBruta: null,
            margen: null,
            foodCost: null,
            markup: null,
        });
    });

    it.each(['100', '120', '-5'])('rechaza el margen objetivo %s', (margen) => {
        expect(() => ProfitabilityCalculator.calculate({ costoReceta: '4000', margenObjetivo: margen }))
            .toThrow(InvalidTargetMarginException);
    });

    it('con costo cero el markup sale en null', () => {
        const result = ProfitabilityCalculator.calculate({ costoReceta: '0', precioVenta: '5000' });

        expect(result.margen).toBe('100.00');
        expect(result.markup).toBeNull();
    });

    it('un precio menor que el costo da margen negativo', () => {
        const result = ProfitabilityCalculator.calculate({ costoReceta: '4000', precioVenta: '3200' });

        expect(result.gananciaBruta).toBe('-800.00');
        expect(result.margen).toBe('-25.00');
    });
});
