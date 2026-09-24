import { BranchAggregate } from '@/context/branch/domain/branch.aggregate';

import { CreateBranchUseCase } from './create-branch.use-case';


/**
 * Pruebas de la creación de sucursales con dobles de prueba.
 *
 * Revisan el orden de las validaciones (que el negocio exista y que el nombre
 * esté libre) y que solo se guarde cuando las dos pasan.
 */

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';

const PARAMS = {
    tenantId: TENANT_ID,
    name: 'Centro',
    address: 'Calle 10 # 5-20',
    phone: '3001234567',
    city: 'Cali',
    department: 'Valle',
};

const buildHarness = (options: { tenantExists?: boolean; nameTaken?: boolean } = {}) => {
    const save = jest.fn().mockResolvedValue(undefined);
    const existsByName = jest.fn().mockResolvedValue(options.nameTaken ?? false);
    const exists = jest.fn().mockResolvedValue(options.tenantExists ?? true);

    const useCase = new CreateBranchUseCase(
        { save, existsByName } as never,
        { exists },
    );

    return { useCase, save, existsByName, exists };
};


describe('CreateBranchUseCase', () => {
    it('guarda la sucursal en el negocio indicado', async () => {
        const { useCase, save } = buildHarness();

        await useCase.execute(PARAMS);

        expect(save).toHaveBeenCalledTimes(1);
        const branch = save.mock.calls[0][0] as BranchAggregate;
        expect(branch.toPrimitives()).toMatchObject({
            tenantId: TENANT_ID,
            name: 'Centro',
            isActive: true,
            isDeleted: false,
        });
    });

    it('responde 1205 si el negocio no existe', async () => {
        const { useCase, save, exists } = buildHarness({ tenantExists: false });

        await expect(useCase.execute(PARAMS)).rejects.toMatchObject({ code: '1205' });
        expect(exists).toHaveBeenCalledWith(TENANT_ID);
        expect(save).not.toHaveBeenCalled();
    });

    it('responde 1206 si el nombre ya está en uso en el negocio', async () => {
        const { useCase, save, existsByName } = buildHarness({ nameTaken: true });

        await expect(useCase.execute(PARAMS)).rejects.toMatchObject({ code: '1206' });
        expect(existsByName).toHaveBeenCalledWith(expect.objectContaining({ value: 'Centro' }), TENANT_ID);
        expect(save).not.toHaveBeenCalled();
    });

    it('valida los campos con los objetos de valor', async () => {
        const { useCase, save } = buildHarness();

        await expect(useCase.execute({ ...PARAMS, phone: '123' })).rejects.toMatchObject({ code: '1011' });
        expect(save).not.toHaveBeenCalled();
    });
});
