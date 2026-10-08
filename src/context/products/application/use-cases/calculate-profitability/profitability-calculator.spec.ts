import {
    InvalidTargetMarginException,
    PriceMarginMismatchException,
} from '../../../domain/exceptions/product-exception';
import { ProfitabilityCalculator } from './profitability-calculator';

describe('ProfitabilityCalculator', () => {

    it('con solo el precio calcula el margen real sobre el precio', () => {
        expect(ProfitabilityCalculator.calculate({ cost: '4000', price: '10000' })).toEqual({
            cost: '4000.00',
            price: '10000.00',
            grossProfit: '6000.00',
            margin: '60.00',
            foodCost: '40.00',
            markup: '150.00',
        });
    });

    it('con solo el margen calcula el precio que lo alcanza', () => {
        expect(ProfitabilityCalculator.calculate({ cost: '4000', targetMargin: '60' })).toEqual({
            cost: '4000.00',
            price: '10000.00',
            grossProfit: '6000.00',
            margin: '60.00',
            foodCost: '40.00',
            markup: '150.00',
        });
    });

    it('con precio y margen que cuadran devuelve el cálculo', () => {
        const result = ProfitabilityCalculator.calculate({
            cost: '4000',
            price: '10000',
            targetMargin: '60',
        });

        expect(result.margin).toBe('60.00');
    });

    it('con precio y margen que no cuadran lanza la excepción', () => {
        expect(() => ProfitabilityCalculator.calculate({
            cost: '4000',
            price: '9000',
            targetMargin: '60',
        })).toThrow(PriceMarginMismatchException);
    });

    it('sin precio ni margen devuelve solo el costo', () => {
        expect(ProfitabilityCalculator.calculate({ cost: '4000.456' })).toEqual({
            cost: '4000.46',
            price: null,
            grossProfit: null,
            margin: null,
            foodCost: null,
            markup: null,
        });
    });

    it.each(['100', '120', '-5'])('rechaza el margen objetivo %s', (margen) => {
        expect(() => ProfitabilityCalculator.calculate({ cost: '4000', targetMargin: margen }))
            .toThrow(InvalidTargetMarginException);
    });

    it('con costo cero el markup sale en null', () => {
        const result = ProfitabilityCalculator.calculate({ cost: '0', price: '5000' });

        expect(result.margin).toBe('100.00');
        expect(result.markup).toBeNull();
    });

    it('un precio menor que el costo da margen negativo', () => {
        const result = ProfitabilityCalculator.calculate({ cost: '4000', price: '3200' });

        expect(result.grossProfit).toBe('-800.00');
        expect(result.margin).toBe('-25.00');
    });
});
