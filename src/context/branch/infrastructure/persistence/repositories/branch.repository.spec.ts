import { QueryFailedError } from 'typeorm';

import { BranchAggregate } from '@/context/branch/domain/branch.aggregate';
import { BranchAddress } from '@/context/branch/domain/value-object/branch-address.value-object';
import { BranchCity } from '@/context/branch/domain/value-object/branch-city.value-object';
import { BranchDepartment } from '@/context/branch/domain/value-object/branch-department.value-object';
import { BranchName } from '@/context/branch/domain/value-object/branch-name.value-object';
import { BranchPhone } from '@/context/branch/domain/value-object/branch-phone.value-object';

import { TypeOrmBranchRepository } from './branch.repository';


/**
 * Pruebas del repositorio de sucursales sin base de datos.
 *
 * Cubren lo que el repositorio decide por su cuenta: traducir la violación del
 * índice único a 1206 y escribir el updatedAt del agregado. Las consultas y sus
 * filtros (negocio, eliminadas, activas) dependen de Postgres y no se prueban aquí.
 */

const buildBranch = (): BranchAggregate => BranchAggregate.create({
    tenantId: '550e8400-e29b-41d4-a716-446655440000',
    name: BranchName.create('Centro'),
    address: BranchAddress.create('Calle 10 # 5-20'),
    phone: BranchPhone.create('3001234567'),
    city: BranchCity.create('Cali'),
    department: BranchDepartment.create('Valle'),
});

/** Un fallo de Postgres tal como lo envuelve TypeORM, con el SQLSTATE en `code`. */
const postgresError = (code: string): QueryFailedError => new QueryFailedError(
    'INSERT INTO branches ...',
    [],
    Object.assign(new Error('fallo de la base'), { code }),
);

const buildRepository = (typeorm: Record<string, jest.Mock>) =>
    new TypeOrmBranchRepository({ create: (row: unknown) => row, ...typeorm } as never);


describe('TypeOrmBranchRepository', () => {
    describe('índice único del nombre', () => {
        it('save responde 1206 cuando Postgres viola el índice', async () => {
            const repository = buildRepository({
                save: jest.fn().mockRejectedValue(postgresError('23505')),
            });

            await expect(repository.save(buildBranch())).rejects.toMatchObject({ code: '1206' });
        });

        it('update responde 1206 cuando Postgres viola el índice', async () => {
            const repository = buildRepository({
                update: jest.fn().mockRejectedValue(postgresError('23505')),
            });

            await expect(repository.update(buildBranch())).rejects.toMatchObject({ code: '1206' });
        });

        it('relanza cualquier otro error de la base sin tocarlo', async () => {
            const error = postgresError('23503');
            const repository = buildRepository({ save: jest.fn().mockRejectedValue(error) });

            await expect(repository.save(buildBranch())).rejects.toBe(error);
        });
    });

    describe('update', () => {
        it('escribe el updatedAt del agregado y no uno propio', async () => {
            // Relojes distintos al crear y al guardar: si el repositorio usara
            // new Date(), la fecha escrita sería la de guardar.
            jest.useFakeTimers().setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
            const update = jest.fn().mockResolvedValue(undefined);
            const branch = buildBranch();

            jest.setSystemTime(new Date('2026-02-01T00:00:00.000Z'));
            await buildRepository({ update }).update(branch);
            jest.useRealTimers();

            expect(update).toHaveBeenCalledWith(
                expect.objectContaining({ isDeleted: false }),
                expect.objectContaining({ updatedAt: new Date('2026-01-01T00:00:00.000Z') }),
            );
        });
    });
});
