import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { UserLoginPayloadDto } from './user-payload.dto';


const basePayload = {
    tenantSlug: 'panaderia-komi',
    username: 'jperez',
    password: 'Sup3rSecreta',
};

/** Los campos que no pasaron la validación. */
const failingProps = (payload: Record<string, unknown>): string[] =>
    validateSync(plainToInstance(UserLoginPayloadDto, payload)).map((error) => error.property);

const repeat = (length: number): string => 'a'.repeat(length);


describe('UserLoginPayloadDto', () => {
    it('acepta un payload válido', () => {
        expect(failingProps(basePayload)).toEqual([]);
    });


    /**
     * Estos topes tienen que ser los mismos que los de los value objects y los de
     * los DTOs de creación (slug hasta 100, userName hasta 30, password hasta 100).
     * Si el login es más estricto termina rechazando con un 400 a gente que el
     * propio sistema dejó registrar.
     */
    describe('límites alineados con el dominio', () => {
        it('acepta un slug de 100 caracteres (TenantSlug.MAX_LENGTH)', () => {
            expect(failingProps({ ...basePayload, tenantSlug: repeat(100) })).toEqual([]);
        });


        it('rechaza un slug de 101 caracteres', () => {
            expect(failingProps({ ...basePayload, tenantSlug: repeat(101) })).toEqual(['tenantSlug']);
        });


        it('acepta un username de 30 caracteres (UserName.MAX_LENGTH)', () => {
            expect(failingProps({ ...basePayload, username: repeat(30) })).toEqual([]);
        });


        it('rechaza un username de 31 caracteres', () => {
            expect(failingProps({ ...basePayload, username: repeat(31) })).toEqual(['username']);
        });


        it('acepta una contraseña de 100 caracteres (tope de create-user)', () => {
            expect(failingProps({ ...basePayload, password: repeat(100) })).toEqual([]);
        });


        it('rechaza una contraseña de 101 caracteres', () => {
            expect(failingProps({ ...basePayload, password: repeat(101) })).toEqual(['password']);
        });


        it('no impone longitud mínima a la contraseña: eso es un 401, no un 400', () => {
            expect(failingProps({ ...basePayload, password: 'corta' })).toEqual([]);
        });
    });


    describe('campos obligatorios', () => {
        it.each(['tenantSlug', 'username', 'password'])('rechaza %s vacío', (field) => {
            expect(failingProps({ ...basePayload, [field]: '' })).toEqual([field]);
        });


        it.each(['tenantSlug', 'username', 'password'])('rechaza %s ausente', (field) => {
            const { [field]: _omitted, ...payload } = basePayload as Record<string, unknown>;

            expect(failingProps(payload)).toEqual([field]);
        });


        it.each(['tenantSlug', 'username', 'password'])('rechaza %s no textual', (field) => {
            expect(failingProps({ ...basePayload, [field]: 12345 })).toEqual([field]);
        });
    });
});
