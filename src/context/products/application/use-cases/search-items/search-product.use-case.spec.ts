import { Paginated } from '@/interfaces';
import { ProductResponse } from '@/context/products/domain/types/product.response';

import { BranchNotFoundForProductsException } from '@/context/products/domain/exceptions/product-exception';

import { SearchProductsUseCase } from './search-product.use-case';


/**
 * Pruebas del listado de productos con dobles de prueba.
 *
 * No revisan el armado del detalle (categoría, receta y costos), que es lo que
 * ya cubre el repositorio real; revisan el contrato del listado: que los
 * filtros y la página lleguen al repositorio tal como entraron y que la
 * respuesta salga con los metadatos de paginación, no como un arreglo suelto.
 */

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';
const BRANCH_ID = '6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b';

const buildProduct = (id: string): ProductResponse => ({
    id,
    tenantId: TENANT_ID,
    productCategoryId: 'categoria-1',
    productName: 'Hamburguesa',
    productDescription: undefined,
    productImgUrl: undefined,
    productSku: 'PRD-001',
    productBasePrice: '20000',
    costCurrency: 'COP',
    profitMargin: '30',
    productStatus: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ingredients: [],
});

const buildHarness = (page: Paginated<ProductResponse>, branchExists = true) => {
    const search = jest.fn().mockResolvedValue(page);
    const existsInTenant = jest.fn().mockResolvedValue(branchExists);

    const useCase = new SearchProductsUseCase(
        { search } as never,
        { exists: jest.fn().mockResolvedValue(true) },
        { get: jest.fn().mockResolvedValue(null) },
        { get: jest.fn().mockResolvedValue({ name: 'Platos fuertes' }) },
        { existsInTenant },
    );

    return { useCase, search, existsInTenant };
};


describe('SearchProductsUseCase', () => {
    it('pasa los filtros y la página al repositorio sin tocarlos', async () => {
        const { useCase, search } = buildHarness({
            rows: [],
            pageNumber: 2,
            pageSize: 20,
            total: 0,
        });

        await useCase.execute(
            {
                tenantId: TENANT_ID,
                text: 'hamburguesa',
                productCategoryId: 'categoria-1',
                productStatus: false,
            },
            { pageNumber: 2, pageSize: 20 },
        );

        expect(search).toHaveBeenCalledWith(
            {
                tenantId: TENANT_ID,
                text: 'hamburguesa',
                productCategoryId: 'categoria-1',
                productStatus: false,
            },
            { pageNumber: 2, pageSize: 20 },
        );
    });

    // El total es del filtro completo, no de la página: el front lo necesita
    // para saber cuántas páginas hay.
    it('devuelve las filas junto con los metadatos de paginación', async () => {
        const { useCase } = buildHarness({
            rows: [buildProduct('producto-1')],
            pageNumber: 1,
            pageSize: 20,
            total: 47,
        });

        const result = await useCase.execute(
            { tenantId: TENANT_ID },
            { pageNumber: 1, pageSize: 20 },
        );

        expect(result.rows).toHaveLength(1);
        expect(result.rows[0]?.id).toBe('producto-1');
        expect(result).toMatchObject({ pageNumber: 1, pageSize: 20, total: 47 });
    });

    describe('sucursal para evaluar el stock', () => {
        const emptyPage = { rows: [], pageNumber: 1, pageSize: 20, total: 0 };

        it('no consulta la sucursal cuando no se envía branchId', async () => {
            const { useCase, existsInTenant } = buildHarness(emptyPage);

            await useCase.execute(
                { tenantId: TENANT_ID },
                { pageNumber: 1, pageSize: 20 },
            );

            expect(existsInTenant).not.toHaveBeenCalled();
        });

        it('valida que la sucursal pertenezca al negocio', async () => {
            const { useCase, existsInTenant } = buildHarness(emptyPage);

            await useCase.execute(
                { tenantId: TENANT_ID, branchId: BRANCH_ID },
                { pageNumber: 1, pageSize: 20 },
            );

            expect(existsInTenant).toHaveBeenCalledWith(BRANCH_ID, TENANT_ID);
        });

        // Una sucursal de otro negocio responde igual que una inexistente,
        // y no se llega a buscar productos.
        it('rechaza una sucursal que no es del negocio', async () => {
            const { useCase, search } = buildHarness(emptyPage, false);

            await expect(
                useCase.execute(
                    { tenantId: TENANT_ID, branchId: BRANCH_ID },
                    { pageNumber: 1, pageSize: 20 },
                ),
            ).rejects.toBeInstanceOf(BranchNotFoundForProductsException);

            expect(search).not.toHaveBeenCalled();
        });
    });
});
