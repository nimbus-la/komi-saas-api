import { Paginated } from '@/interfaces';
import { BranchResponse } from '@/context/branch/domain/interfaces/branch.interfaces';

import { SearchBranchesUseCase } from './search-branches.use-case';


/**
 * Pruebas del listado de sucursales con dobles de prueba.
 *
 * El caso de uso no filtra nada por su cuenta: revisan que los filtros y la
 * página lleguen al repositorio tal como entraron y que la respuesta salga
 * paginada.
 */

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';

const PAGE: Paginated<BranchResponse> = {
    rows: [],
    pageNumber: 2,
    pageSize: 10,
    total: 0,
};


describe('SearchBranchesUseCase', () => {
    it('pasa los filtros y la página al repositorio sin tocarlos', async () => {
        const search = jest.fn().mockResolvedValue(PAGE);
        const useCase = new SearchBranchesUseCase({ search } as never);

        const filters = {
            tenantId: TENANT_ID,
            branchId: '8f14e45f-ceea-467a-9575-4b2c1d2a3f10',
            text: 'cali',
            branchStatus: false,
        };

        const result = await useCase.execute(filters, { pageNumber: 2, pageSize: 10 });

        expect(search).toHaveBeenCalledWith(filters, { pageNumber: 2, pageSize: 10 });
        expect(result).toEqual(PAGE);
    });
});
