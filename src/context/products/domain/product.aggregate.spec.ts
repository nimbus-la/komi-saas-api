import { BasePriceError, Money } from '@/shared';

import { InvalidProfitMarginException, PriceMarginMismatchException } from './exceptions/product-exception';
import { Product } from './product.aggregate';
import { ProductName } from './value-object/product-name.value-object';
import { ProductSku } from './value-object/product-sku.value-object';
import { ProfitMargin } from './value-object/profit-margin.value-object';


/**
 * El precio de un producto tiene que dejar su margen sobre su costo, al crear
 * y al actualizar. Las fórmulas en sí las cubre la prueba de la calculadora.
 */

const build = (pricing: { price: string; cost: string; margin: string }): Product => Product.create({
    tenantId: '550e8400-e29b-41d4-a716-446655440000',
    productCategoryId: 'categoria-1',
    productName: ProductName.create('Hamburguesa'),
    productDescription: undefined,
    productSku: ProductSku.fromNumber(1),
    productImgUrl: undefined,
    productBasePrice: Money.of(pricing.price),
    productCost: Money.of(pricing.cost),
    profitMargin: ProfitMargin.create(pricing.margin),
});

const updatePricing = (product: Product, pricing: { price: string; cost: string; margin: string }): void => {
    const current = product.toPrimitives();

    product.update({
        productCategoryId: current.productCategoryId,
        productName: ProductName.create(current.productName),
        productDescription: current.productDescription,
        productImgUrl: current.productImgUrl,
        productBasePrice: Money.of(pricing.price),
        productCost: Money.of(pricing.cost),
        profitMargin: ProfitMargin.create(pricing.margin),
    });
};


describe('Product: precio, costo y margen', () => {
    it('crea el producto cuando el precio deja el margen sobre el costo', () => {
        const product = build({ price: '10000', cost: '4000', margin: '60' });

        expect(product.toPrimitives()).toMatchObject({
            productBasePrice: '10000.00',
            productCost: '4000.00',
            profitMargin: '60.00',
        });
    });

    it('rechaza un precio que no deja el margen', () => {
        expect(() => build({ price: '9000', cost: '4000', margin: '60' }))
            .toThrow(PriceMarginMismatchException);
    });

    it('rechaza un precio en 0', () => {
        expect(() => build({ price: '0', cost: '4000', margin: '60' }))
            .toThrow(BasePriceError);
    });

    it.each(['0', '100', '120'])('rechaza el margen %s', (margin) => {
        expect(() => ProfitMargin.create(margin)).toThrow(InvalidProfitMarginException);
    });

    it('al actualizar solo el precio, rechaza si deja de cuadrar', () => {
        const product = build({ price: '10000', cost: '4000', margin: '60' });

        expect(() => updatePricing(product, { price: '12000', cost: '4000', margin: '60' }))
            .toThrow(PriceMarginMismatchException);
    });

    it('al actualizar acepta un precio, costo y margen que cuadran', () => {
        const product = build({ price: '10000', cost: '4000', margin: '60' });

        updatePricing(product, { price: '12000', cost: '4000', margin: '66.67' });

        expect(product.toPrimitives()).toMatchObject({ productBasePrice: '12000.00', profitMargin: '66.67' });
    });
});
