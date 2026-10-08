import { EntityStatus } from '@/shared';
import { ProductDeletedEvent } from '@/context/products/domain/events/product-deleted.event';
import {
    ProductNotFoundException,
    TenantNotFoundException,
} from '@/context/products/domain/exceptions/product-exception';
import { Product } from '@/context/products/domain/product.aggregate';

import { DeleteProductUseCase } from './delete-product.use-case';


const TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';
const PRODUCT_ID = '6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b';
const USER_ID = '7a2b3c4d-5e6f-4a70-8b9c-0d1e2f3a4b5c';

const buildProduct = (): Product => Product.fromPrimitives({
    id: PRODUCT_ID,
    tenantId: TENANT_ID,
    productCategoryId: 'categoria-1',
    productName: 'Hamburguesa',
    productDescription: undefined,
    productSku: 'PROD-0001',
    productImgUrl: undefined,
    productBasePrice: '20000',
    costCurrency: 'COP',
    profitMargin: '30',
    status: EntityStatus.Active,
    ingredients: [],
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
});

/** Arma el caso de uso con dobles; el repositorio devuelve el producto que se le pase. */
const build = (product: Product | null, tenantExists = true) => {
    const findById = jest.fn().mockResolvedValue(product);
    const update = jest.fn().mockResolvedValue(undefined);
    const publish = jest.fn().mockResolvedValue(undefined);

    const useCase = new DeleteProductUseCase(
        { findById, update } as never,
        { exists: jest.fn().mockResolvedValue(tenantExists) },
        { publish },
    );

    return { useCase, findById, update, publish };
};

const params = { id: PRODUCT_ID, tenantId: TENANT_ID, deletedBy: USER_ID };


describe('DeleteProductUseCase', () => {
    it('rechaza un negocio que no existe sin buscar el producto', async () => {
        const { useCase, findById } = build(buildProduct(), false);

        await expect(useCase.execute(params)).rejects.toBeInstanceOf(TenantNotFoundException);
        expect(findById).not.toHaveBeenCalled();
    });

    it('responde que no existe cuando el repositorio no encuentra el producto', async () => {
        const { useCase, update, publish } = build(null);

        await expect(useCase.execute(params)).rejects.toBeInstanceOf(ProductNotFoundException);
        expect(update).not.toHaveBeenCalled();
        expect(publish).not.toHaveBeenCalled();
    });

    it('guarda el producto como eliminado y publica el evento con quién lo eliminó', async () => {
        const product = buildProduct();
        const { useCase, update, publish } = build(product);

        await useCase.execute(params);

        expect(update).toHaveBeenCalledWith(product);
        expect(product.getStatus()).toBe(EntityStatus.Deleted);

        const [events] = publish.mock.calls[0] as [ProductDeletedEvent[]];
        expect(events).toHaveLength(1);
        expect(events[0]).toBeInstanceOf(ProductDeletedEvent);
        expect(events[0]).toMatchObject({ productId: PRODUCT_ID, tenantId: TENANT_ID, deletedBy: USER_ID });

        expect(product.getDomainEvents()).toHaveLength(0);
    });
});
