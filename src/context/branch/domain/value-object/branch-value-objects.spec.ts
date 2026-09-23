import { BranchAddress } from './branch-address.value-object';
import { BranchCity } from './branch-city.value-object';
import { BranchDepartment } from './branch-department.value-object';
import { BranchId } from './branch-id.value-object';
import { BranchName } from './branch-name.value-object';
import { BranchPhone } from './branch-phone.value-object';


/**
 * Pruebas de los objetos de valor de la sucursal.
 *
 * Todos siguen la misma forma: recortan espacios y validan un largo mínimo y
 * máximo, cada uno con su propio código de error.
 */

describe('Objetos de valor de la sucursal', () => {
    it.each([
        ['BranchName', (v: string) => BranchName.create(v), 2, 30, '1009'],
        ['BranchAddress', (v: string) => BranchAddress.create(v), 5, 100, '1010'],
        ['BranchPhone', (v: string) => BranchPhone.create(v), 7, 15, '1011'],
        ['BranchCity', (v: string) => BranchCity.create(v), 2, 50, '1012'],
        ['BranchDepartment', (v: string) => BranchDepartment.create(v), 2, 50, '1013'],
    ])('%s acepta de %i a %i caracteres y fuera de eso responde %s', (_, create, min, max, code) => {
        expect(create('1'.repeat(min)).value).toHaveLength(min);
        expect(create('1'.repeat(max)).value).toHaveLength(max);

        expect(() => create('1'.repeat(min - 1))).toThrow(expect.objectContaining({ code }));
        expect(() => create('1'.repeat(max + 1))).toThrow(expect.objectContaining({ code }));
    });

    it('recorta los espacios antes de validar', () => {
        expect(BranchName.create('  Centro  ').value).toBe('Centro');
        expect(() => BranchName.create('   a   ')).toThrow(expect.objectContaining({ code: '1009' }));
    });

    it('BranchName compara sin importar mayúsculas', () => {
        expect(BranchName.create('Centro').equals(BranchName.create('CENTRO'))).toBe(true);
    });

    describe('BranchId', () => {
        it('rechaza un valor que no es UUID con 1014', () => {
            expect(() => BranchId.create('abc')).toThrow(expect.objectContaining({ code: '1014' }));
        });

        it('genera UUID distintos', () => {
            expect(BranchId.generate().value).not.toBe(BranchId.generate().value);
        });
    });
});
