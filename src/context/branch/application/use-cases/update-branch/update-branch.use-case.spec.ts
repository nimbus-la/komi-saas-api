import { BranchAggregate } from '@/context/branch/domain/branch.aggregate';
import { BranchAddress } from '@/context/branch/domain/value-object/branch-address.value-object';
import { BranchCity } from '@/context/branch/domain/value-object/branch-city.value-object';
import { BranchDepartment } from '@/context/branch/domain/value-object/branch-department.value-object';
import { BranchName } from '@/context/branch/domain/value-object/branch-name.value-object';
import { BranchPhone } from '@/context/branch/domain/value-object/branch-phone.value-object';

import { UpdateBranchUseCase } from './update-branch.use-case';


/**
 * Pruebas de la actualización de sucursales con dobles de prueba.
 *
 * Las reglas de cada campo ya las cubre el agregado. Aquí se revisa lo que
 * decide el caso de uso: buscar la sucursal dentro del negocio, cuándo
 * consultar si el nombre está ocupado y guardar solo si todo pasa.
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

const buildHarness = (options: { branch?: BranchAggregate | null; nameTaken?: boolean } = {}) => {
    const branch = options.branch === undefined ? buildBranch() : options.branch;
    const searchAggregateById = jest.fn().mockResolvedValue(branch);
    const existsByName = jest.fn().mockResolvedValue(options.nameTaken ?? false);
    const update = jest.fn().mockResolvedValue(undefined);

    const useCase = new UpdateBranchUseCase(
        { searchAggregateById, existsByName, update } as never,
    );

    return { useCase, branch, searchAggregateById, existsByName, update };
};


describe('UpdateBranchUseCase', () => {
    it('busca la sucursal dentro del negocio del token y guarda el cambio', async () => {
        const { useCase, branch, searchAggregateById, update } = buildHarness();

        await useCase.execute(BRANCH_ID, TENANT_ID, { city: 'Palmira' });

        expect(searchAggregateById).toHaveBeenCalledWith(
            expect.objectContaining({ value: BRANCH_ID }),
            TENANT_ID,
        );
        expect(update).toHaveBeenCalledWith(branch);
        expect(branch?.toPrimitives().city).toBe('Palmira');
    });

    it('responde 1207 si la sucursal no existe, es de otro negocio o está eliminada', async () => {
        const { useCase, update } = buildHarness({ branch: null });

        await expect(useCase.execute(BRANCH_ID, TENANT_ID, { city: 'Palmira' }))
            .rejects.toMatchObject({ code: '1207' });
        expect(update).not.toHaveBeenCalled();
    });

    it('responde 1206 si el nombre nuevo lo tiene otra sucursal', async () => {
        const { useCase, update } = buildHarness({ nameTaken: true });

        await expect(useCase.execute(BRANCH_ID, TENANT_ID, { name: 'Norte' }))
            .rejects.toMatchObject({ code: '1206' });
        expect(update).not.toHaveBeenCalled();
    });

    it('permite cambiar solo las mayúsculas del nombre sin consultar la base', async () => {
        const { useCase, existsByName, update } = buildHarness({ nameTaken: true });

        await useCase.execute(BRANCH_ID, TENANT_ID, { name: 'CENTRO' });

        expect(existsByName).not.toHaveBeenCalled();
        expect(update).toHaveBeenCalled();
    });

    it('responde 1032 si el nombre es exactamente el actual', async () => {
        const { useCase, update } = buildHarness();

        await expect(useCase.execute(BRANCH_ID, TENANT_ID, { name: 'Centro' }))
            .rejects.toMatchObject({ code: '1032' });
        expect(update).not.toHaveBeenCalled();
    });

    it('responde 1031 si no llega ningún campo', async () => {
        const { useCase, update } = buildHarness();

        await expect(useCase.execute(BRANCH_ID, TENANT_ID, {}))
            .rejects.toMatchObject({ code: '1031' });
        expect(update).not.toHaveBeenCalled();
    });

    it('cambia el estado con isActive', async () => {
        const { useCase, branch, update } = buildHarness();

        await useCase.execute(BRANCH_ID, TENANT_ID, { isActive: false });

        expect(branch?.active).toBe(false);
        expect(update).toHaveBeenCalledWith(branch);
    });
});
