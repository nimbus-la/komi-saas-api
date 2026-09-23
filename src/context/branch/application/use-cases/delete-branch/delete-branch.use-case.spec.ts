import { BranchAggregate } from '@/context/branch/domain/branch.aggregate';
import { BranchAddress } from '@/context/branch/domain/value-object/branch-address.value-object';
import { BranchCity } from '@/context/branch/domain/value-object/branch-city.value-object';
import { BranchDepartment } from '@/context/branch/domain/value-object/branch-department.value-object';
import { BranchName } from '@/context/branch/domain/value-object/branch-name.value-object';
import { BranchPhone } from '@/context/branch/domain/value-object/branch-phone.value-object';

import { DeleteBranchUseCase } from './delete-branch.use-case';


/**
 * Pruebas del borrado lógico de sucursales con dobles de prueba.
 *
 * El repositorio nunca devuelve sucursales eliminadas ni de otro negocio, así
 * que en los dos casos el caso de uso recibe null y responde 1207.
 */

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';
const BRANCH_ID = '8f14e45f-ceea-467a-9575-4b2c1d2a3f10';

const buildBranch = (): BranchAggregate => BranchAggregate.create({
    tenantId: TENANT_ID,
    name: BranchName.create('Centro'),
    address: BranchAddress.create('Calle 10 # 5-20'),
    phone: BranchPhone.create('3001234567'),
    city: BranchCity.create('Cali'),
    department: BranchDepartment.create('Valle'),
});

const buildHarness = (branch: BranchAggregate | null) => {
    const searchAggregateById = jest.fn().mockResolvedValue(branch);
    const update = jest.fn().mockResolvedValue(undefined);

    const useCase = new DeleteBranchUseCase({ searchAggregateById, update } as never);

    return { useCase, searchAggregateById, update };
};


describe('DeleteBranchUseCase', () => {
    it('marca la sucursal como eliminada y la guarda', async () => {
        const branch = buildBranch();
        const { useCase, searchAggregateById, update } = buildHarness(branch);

        await useCase.execute(BRANCH_ID, TENANT_ID);

        expect(searchAggregateById).toHaveBeenCalledWith(
            expect.objectContaining({ value: BRANCH_ID }),
            TENANT_ID,
        );
        expect(branch.toPrimitives().isDeleted).toBe(true);
        expect(update).toHaveBeenCalledWith(branch);
    });

    it('responde 1207 si la sucursal no aparece', async () => {
        const { useCase, update } = buildHarness(null);

        await expect(useCase.execute(BRANCH_ID, TENANT_ID)).rejects.toMatchObject({ code: '1207' });
        expect(update).not.toHaveBeenCalled();
    });

    it('responde 1014 si el id no es un UUID', async () => {
        const { useCase, searchAggregateById } = buildHarness(null);

        await expect(useCase.execute('abc', TENANT_ID)).rejects.toMatchObject({ code: '1014' });
        expect(searchAggregateById).not.toHaveBeenCalled();
    });
});
