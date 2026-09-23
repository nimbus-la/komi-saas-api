import { BranchAggregate } from './branch.aggregate';
import { BranchCreatedEvent } from './events/branch-created.event';
import { BranchAddress } from './value-object/branch-address.value-object';
import { BranchCity } from './value-object/branch-city.value-object';
import { BranchDepartment } from './value-object/branch-department.value-object';
import { BranchName } from './value-object/branch-name.value-object';
import { BranchPhone } from './value-object/branch-phone.value-object';


/**
 * Pruebas de las reglas del agregado de sucursal.
 *
 * Se concentran en update(), que es donde viven casi todas: rechazar un update
 * vacío o con valores iguales a los actuales, permitir corregir mayúsculas del
 * nombre y cambiar el estado sin dejar el agregado a medio modificar si algo falla.
 */

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';

const buildBranch = (): BranchAggregate => BranchAggregate.create({
    tenantId: TENANT_ID,
    name: BranchName.create('Centro'),
    address: BranchAddress.create('Calle 10 # 5-20'),
    phone: BranchPhone.create('3001234567'),
    city: BranchCity.create('Cali'),
    department: BranchDepartment.create('Valle'),
});


describe('BranchAggregate', () => {
    afterEach(() => {
        jest.useRealTimers();
    });

    describe('create', () => {
        it('nace activa y sin eliminar', () => {
            const primitives = buildBranch().toPrimitives();

            expect(primitives.isActive).toBe(true);
            expect(primitives.isDeleted).toBe(false);
            expect(primitives.tenantId).toBe(TENANT_ID);
        });

        it('registra el evento de sucursal creada', () => {
            const events = buildBranch().getDomainEvents();

            expect(events).toHaveLength(1);
            expect(events[0]).toBeInstanceOf(BranchCreatedEvent);
        });
    });

    describe('update', () => {
        it('cambia solo los campos que llegan', () => {
            const branch = buildBranch();

            branch.update({ city: BranchCity.create('Palmira') });

            expect(branch.toPrimitives()).toMatchObject({
                name: 'Centro',
                city: 'Palmira',
                department: 'Valle',
            });
        });

        it('actualiza updatedAt', () => {
            jest.useFakeTimers().setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
            const branch = buildBranch();

            jest.setSystemTime(new Date('2026-02-01T00:00:00.000Z'));
            branch.update({ city: BranchCity.create('Palmira') });

            expect(branch.toPrimitives().updatedAt).toEqual(new Date('2026-02-01T00:00:00.000Z'));
            expect(branch.toPrimitives().createdAt).toEqual(new Date('2026-01-01T00:00:00.000Z'));
        });

        it('rechaza un update sin campos con 1031', () => {
            expect(() => buildBranch().update({})).toThrow(
                expect.objectContaining({ code: '1031' }),
            );
        });

        it.each([
            ['nombre', { name: BranchName.create('Centro') }],
            ['dirección', { address: BranchAddress.create('Calle 10 # 5-20') }],
            ['teléfono', { phone: BranchPhone.create('3001234567') }],
            ['ciudad', { city: BranchCity.create('Cali') }],
            ['departamento', { department: BranchDepartment.create('Valle') }],
        ])('rechaza el %s igual al actual con 1032', (field, params) => {
            expect(() => buildBranch().update(params)).toThrow(
                expect.objectContaining({ code: '1032', detail: expect.stringContaining(field) }),
            );
        });

        it('permite cambiar solo las mayúsculas del nombre', () => {
            const branch = buildBranch();

            branch.update({ name: BranchName.create('CENTRO') });

            expect(branch.toPrimitives().name).toBe('CENTRO');
        });

        it('no cambia nada si un campo es igual al actual', () => {
            const branch = buildBranch();

            expect(() => branch.update({
                city: BranchCity.create('Palmira'),
                phone: BranchPhone.create('3001234567'),
            })).toThrow(expect.objectContaining({ code: '1032' }));

            expect(branch.toPrimitives().city).toBe('Cali');
        });
    });

    describe('estado dentro de update', () => {
        it('desactiva con isActive false, aunque no llegue otro campo', () => {
            const branch = buildBranch();

            branch.update({ isActive: false });

            expect(branch.active).toBe(false);
        });

        it('reactiva una sucursal inactiva con isActive true', () => {
            const branch = buildBranch();
            branch.update({ isActive: false });

            branch.update({ isActive: true });

            expect(branch.active).toBe(true);
        });

        it('rechaza activar una sucursal activa con 1217', () => {
            expect(() => buildBranch().update({ isActive: true })).toThrow(
                expect.objectContaining({ code: '1217' }),
            );
        });

        it('rechaza desactivar una sucursal inactiva con 1216 sin aplicar los demás campos', () => {
            const branch = buildBranch();
            branch.update({ isActive: false });

            expect(() => branch.update({
                isActive: false,
                name: BranchName.create('Norte'),
            })).toThrow(expect.objectContaining({ code: '1216' }));

            expect(branch.toPrimitives().name).toBe('Centro');
        });

        it('cambia el estado y otros campos en la misma llamada', () => {
            const branch = buildBranch();

            branch.update({ isActive: false, city: BranchCity.create('Palmira') });

            expect(branch.active).toBe(false);
            expect(branch.toPrimitives().city).toBe('Palmira');
        });
    });

    describe('delete', () => {
        it('marca la sucursal como eliminada y actualiza updatedAt', () => {
            jest.useFakeTimers().setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
            const branch = buildBranch();

            jest.setSystemTime(new Date('2026-02-01T00:00:00.000Z'));
            branch.delete();

            expect(branch.toPrimitives().isDeleted).toBe(true);
            expect(branch.toPrimitives().updatedAt).toEqual(new Date('2026-02-01T00:00:00.000Z'));
        });
    });

    describe('hasName', () => {
        it('compara el nombre sin importar mayúsculas', () => {
            const branch = buildBranch();

            expect(branch.hasName(BranchName.create('centro'))).toBe(true);
            expect(branch.hasName(BranchName.create('Norte'))).toBe(false);
        });
    });

    describe('fromPrimitives / toPrimitives', () => {
        it('reconstruye la misma sucursal', () => {
            const primitives = buildBranch().toPrimitives();

            expect(BranchAggregate.fromPrimitives(primitives).toPrimitives()).toEqual(primitives);
        });
    });
});
