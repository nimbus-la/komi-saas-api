import { ProductBranchConfigEntity } from '@/context/product-branch-config/infrastructure/persistence/models/product-branch-config.entity';

import { ProductEntity } from '../models/product.entity';
import { ProductMapper } from './products-mapper';


/**
 * Cómo se combina el producto general con su configuración en una sucursal al
 * listar: el precio de la sucursal reemplaza al general y su estado solo puede
 * apagar el producto.
 */

const buildRow = (isActive = true): ProductEntity => Object.assign(new ProductEntity(), {
    id: 'producto-1',
    tenantId: 'negocio-1',
    productCategoryId: 'categoria-1',
    name: 'Hamburguesa',
    description: null,
    basePrice: '20000.00',
    profitMargin: '30.00',
    isActive,
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


describe('ProductMapper.toResponse con la configuración de la sucursal', () => {
    it('sin configuración devuelve los valores generales', () => {
        const response = ProductMapper.toResponse(buildRow(), []);

        expect(response).toMatchObject({
            productBasePrice: '20000.00',
            costCurrency: 'COP',
            productStatus: true,
        });
    });

    it('usa el precio y la moneda de la sucursal cuando tiene precio propio', () => {
        const response = ProductMapper.toResponse(
            buildRow(),
            [],
            buildConfig({ priceAmount: '25000.00', priceCurrency: 'USD' }),
        );

        expect(response).toMatchObject({ productBasePrice: '25000.00', costCurrency: 'USD' });
    });

    it('hereda el precio general cuando la sucursal no lo define', () => {
        const response = ProductMapper.toResponse(
            buildRow(),
            [],
            buildConfig({ isAvailable: false }),
        );

        expect(response).toMatchObject({ productBasePrice: '20000.00', costCurrency: 'COP' });
    });

    it('apaga el producto cuando la sucursal lo marca como no disponible', () => {
        const response = ProductMapper.toResponse(
            buildRow(true),
            [],
            buildConfig({ isAvailable: false }),
        );

        expect(response.productStatus).toBe(false);
    });

    it('mantiene inactivo un producto apagado en general aunque la sucursal lo tenga disponible', () => {
        const response = ProductMapper.toResponse(
            buildRow(false),
            [],
            buildConfig({ isAvailable: true }),
        );

        expect(response.productStatus).toBe(false);
    });
});
