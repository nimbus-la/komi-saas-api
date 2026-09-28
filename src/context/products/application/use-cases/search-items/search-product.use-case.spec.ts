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

const buildProduct = (
    id: string,
    ingredients: ProductResponse['ingredients'] = [],
): ProductResponse => ({
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
    ingredients,
});

const ingredient = (inventoryItemId: string, quantity = '1') => ({
    id: `receta-${inventoryItemId}`,
    inventoryItemId,
    quantity,
    isOptional: false,
});

const buildHarness = (page: Paginated<ProductResponse>, branchExists = true) => {
    const search = jest.fn().mockResolvedValue(page);
    const existsInTenant = jest.fn().mockResolvedValue(branchExists);
    const getMany = jest.fn().mockResolvedValue(new Map([
        ['pan', {
            inventoryItemId: 'pan', name: 'Pan', unitOfMeasure: 'UND', unitCostAmount: '500', currentStock: '10', isActive: true,
            branchStock: { currentStock: '3', minStock: '5' },
        }],
    ]));

    const useCase = new SearchProductsUseCase(
        { search } as never,
        { exists: jest.fn().mockResolvedValue(true) },
        { getMany },
        { get: jest.fn().mockResolvedValue({ name: 'Platos fuertes' }) },
        { existsInTenant },
    );

    return { useCase, search, existsInTenant, getMany };
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

    describe('carga de los insumos de la receta', () => {
        it('consulta el inventario una sola vez por página y sin ids repetidos', async () => {
            const { useCase, getMany } = buildHarness({
                rows: [
                    buildProduct('producto-1', [ingredient('pan'), ingredient('carne')]),
                    buildProduct('producto-2', [ingredient('pan')]),
                ],
                pageNumber: 1,
                pageSize: 20,
                total: 2,
            });

            await useCase.execute(
                { tenantId: TENANT_ID },
                { pageNumber: 1, pageSize: 20 },
            );

            expect(getMany).toHaveBeenCalledTimes(1);
            expect(getMany).toHaveBeenCalledWith(TENANT_ID, ['pan', 'carne'], undefined);
        });

        it('no consulta el inventario si ningún producto tiene receta', async () => {
            const { useCase, getMany } = buildHarness({
                rows: [buildProduct('producto-1')],
                pageNumber: 1,
                pageSize: 20,
                total: 1,
            });

            await useCase.execute(
                { tenantId: TENANT_ID },
                { pageNumber: 1, pageSize: 20 },
            );

            expect(getMany).not.toHaveBeenCalled();
        });

        // Un insumo que no vino del inventario (borrado o de otro negocio)
        // sale sin nombre ni costo, igual que antes de cargar en bloque.
        it('arma cada ingrediente con la información de su insumo', async () => {
            const { useCase } = buildHarness({
                rows: [buildProduct('producto-1', [ingredient('pan', '2'), ingredient('carne')])],
                pageNumber: 1,
                pageSize: 20,
                total: 1,
            });

            const { rows } = await useCase.execute(
                { tenantId: TENANT_ID },
                { pageNumber: 1, pageSize: 20 },
            );

            expect(rows[0]?.ingredients).toEqual([
                expect.objectContaining({ inventoryItemId: 'pan', name: 'Pan', lineCostAmount: '1000', hasStock: true }),
                expect.objectContaining({ inventoryItemId: 'carne', name: '', lineCostAmount: null, hasStock: false }),
            ]);
        });
    });

    describe('estado de stock por sucursal', () => {
        const page = {
            rows: [buildProduct('producto-1', [ingredient('pan'), ingredient('carne')])],
            pageNumber: 1,
            pageSize: 20,
            total: 1,
        };

        it('no incluye stockStatus cuando no se envía branchId', async () => {
            const { useCase } = buildHarness(page);

            const { rows } = await useCase.execute(
                { tenantId: TENANT_ID },
                { pageNumber: 1, pageSize: 20 },
            );

            for (const item of rows[0]?.ingredients ?? []) {
                expect(item).not.toHaveProperty('stockStatus');
            }
        });

        it('evalúa cada insumo con el stock de la sucursal enviada', async () => {
            const { useCase, getMany } = buildHarness(page);

            const { rows } = await useCase.execute(
                { tenantId: TENANT_ID, branchId: BRANCH_ID },
                { pageNumber: 1, pageSize: 20 },
            );

            expect(getMany).toHaveBeenCalledWith(TENANT_ID, ['pan', 'carne'], BRANCH_ID);
            expect(rows[0]?.ingredients).toEqual([
                // 3 en la sede con mínimo 5: bajo mínimo, aunque en total haya 10.
                expect.objectContaining({ inventoryItemId: 'pan', stockStatus: 'LOW' }),
                // No vino del inventario: se trata como agotado.
                expect.objectContaining({ inventoryItemId: 'carne', stockStatus: 'OUT' }),
            ]);
        });
    });

    describe('alerta de stock del producto', () => {
        const page = (ingredients: ProductResponse['ingredients']) => ({
            rows: [buildProduct('producto-1', ingredients)],
            pageNumber: 1,
            pageSize: 20,
            total: 1,
        });

        it('no incluye stockAlert cuando no se envía branchId', async () => {
            const { useCase } = buildHarness(page([ingredient('pan')]));

            const { rows } = await useCase.execute(
                { tenantId: TENANT_ID },
                { pageNumber: 1, pageSize: 20 },
            );

            expect(rows[0]).not.toHaveProperty('stockAlert');
        });

        // El detalle de qué insumo falla va en el stockStatus de cada ingrediente.
        it('da ERROR sin detalle de insumos cuando uno obligatorio está agotado', async () => {
            const { useCase } = buildHarness(page([ingredient('pan'), ingredient('carne', '0.2')]));

            const { rows } = await useCase.execute(
                { tenantId: TENANT_ID, branchId: BRANCH_ID },
                { pageNumber: 1, pageSize: 20 },
            );

            expect(rows[0]?.stockAlert).toBe('ERROR');
        });

        it('da WARNING cuando el único agotado es opcional', async () => {
            const { useCase } = buildHarness(page([
                ingredient('pan'),
                { ...ingredient('carne'), isOptional: true },
            ]));

            const { rows } = await useCase.execute(
                { tenantId: TENANT_ID, branchId: BRANCH_ID },
                { pageNumber: 1, pageSize: 20 },
            );

            expect(rows[0]?.stockAlert).toBe('WARNING');
        });

        it('devuelve null cuando todos los insumos están bien', async () => {
            const { useCase, getMany } = buildHarness(page([ingredient('pan')]));

            getMany.mockResolvedValue(new Map([
                ['pan', {
                    inventoryItemId: 'pan', name: 'Pan', unitOfMeasure: 'UND', unitCostAmount: '500', currentStock: '10', isActive: true,
                    branchStock: { currentStock: '10', minStock: '5' },
                }],
            ]));

            const { rows } = await useCase.execute(
                { tenantId: TENANT_ID, branchId: BRANCH_ID },
                { pageNumber: 1, pageSize: 20 },
            );

            expect(rows[0]?.stockAlert).toBeNull();
        });
    });
});
