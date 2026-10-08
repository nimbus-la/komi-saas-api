import { EntityStatus } from '@/shared';
import { ProductBranchConfigEntity } from '@/context/product-branch-config/infrastructure/persistence/models/product-branch-config.entity';

import { ProductEntity } from '../models/product.entity';
import { ProductMapper } from './products-mapper';


/**
 * Respuesta del producto en esta versión y, aparte, la respuesta anterior que
 * combinaba el producto con su configuración en una sucursal (el precio de la
 * sucursal reemplaza al general). Esa queda desconectada pero se sigue probando.
 */

const buildRow = (): ProductEntity => Object.assign(new ProductEntity(), {
    id: 'producto-1',
    tenantId: 'negocio-1',
    productCategoryId: 'categoria-1',
    name: 'Hamburguesa',
    description: null,
    basePrice: '20000.00',
    profitMargin: '30.00',
    status: EntityStatus.Active,
    imageUrl: null,
    sku: 'PRD-001',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
});

const buildConfig = (
    overrides: Partial<ProductBranchConfigEntity>,
): ProductBranchConfigEntity => Object.assign(new ProductBranchConfigEntity(), {
    id: 'config-1',
    tenantId: 'negocio-1',
    productId: 'producto-1',
    branchId: 'sucursal-1',
    priceAmount: null,
    priceCurrency: null,
    isAvailable: null,
    ...overrides,
});


describe('ProductMapper.toResponse', () => {
    it('devuelve el producto con los nombres de esta versión y sin receta', () => {
        const response = ProductMapper.toResponse(buildRow());

        expect(response).toEqual({
            id: 'producto-1',
            sku: 'PRD-001',
            name: 'Hamburguesa',
            categoryId: 'categoria-1',
            description: undefined,
            imageUrl: undefined,
            price: '20000.00',
            currency: 'COP',
            targetMargin: '30.00',
            status: EntityStatus.Active,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        });
    });
});


describe('ProductMapper.toRecipeResponse (desconectado) con la configuración de la sucursal', () => {
    it('sin configuración devuelve los valores generales', () => {
        const response = ProductMapper.toRecipeResponse(buildRow(), []);

        expect(response).toMatchObject({
            productBasePrice: '20000.00',
            costCurrency: 'COP',
            status: EntityStatus.Active,
        });
    });

    it('usa el precio y la moneda de la sucursal cuando tiene precio propio', () => {
        const response = ProductMapper.toRecipeResponse(
            buildRow(),
            [],
            buildConfig({ priceAmount: '25000.00', priceCurrency: 'USD' }),
        );

        expect(response).toMatchObject({ productBasePrice: '25000.00', costCurrency: 'USD' });
    });

    it('hereda el precio general cuando la sucursal no lo define', () => {
        const response = ProductMapper.toRecipeResponse(
            buildRow(),
            [],
            buildConfig({ isAvailable: false }),
        );

        expect(response).toMatchObject({ productBasePrice: '20000.00', costCurrency: 'COP' });
    });
});
