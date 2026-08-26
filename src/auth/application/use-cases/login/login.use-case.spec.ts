import {
    AuthTenantNotFoundException,
    InactiveAccountException,
    InactiveTenantException,
    InvalidCredentialsException,
} from '../../../domain';

import { AuthUserCredentials, LoginParams, ResolvedTenant } from '../../dtos';
import { LoginUseCase } from './login.use-case';


const activeTenant: ResolvedTenant = {
    id: 'e4d0f0a2-1b7c-4a35-9d61-7c2f8b0a3e11',
    name: 'Panadería Komi',
    description: 'Negocio de prueba',
    slug: 'panaderia-komi',
    nit: '900123456-7',
    created_at: new Date('2026-01-01T00:00:00.000Z'),
    updated_at: new Date('2026-01-01T00:00:00.000Z'),
    isActive: true,
};

const tenantWith = (overrides: Partial<ResolvedTenant>): ResolvedTenant => ({
    ...activeTenant,
    ...overrides,
});


const activeUser: AuthUserCredentials = {
    userId: '3f1c9b6e-5a72-4d18-8c04-2b9e7a1d6f30',
    tenantId: activeTenant.id,
    branchId: 'b7a2c4d8-9e13-4f56-a0b1-2c3d4e5f6a7b',
    rolId: '11111111-2222-3333-4444-555555555555',
    rolScope: 'BRANCH',
    userName: 'jperez',
    firstName: 'Juan',
    secondName: null,
    firstLastName: 'Pérez',
    secondLastName: 'Gómez',
    sex: 'M',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$hash-de-prueba',
    isActive: true,
};

const userWith = (overrides: Partial<AuthUserCredentials>): AuthUserCredentials => ({
    ...activeUser,
    ...overrides,
});


const validParams: LoginParams = {
    tenantSlug: activeTenant.slug,
    username: activeUser.userName,
    password: 'Sup3rSecreta',
};


interface Harness {
    useCase: LoginUseCase;
    findBySlug: jest.Mock;
    findByUserName: jest.Mock;
    verify: jest.Mock;
    verifyAgainstDummy: jest.Mock;
}

/**
 * Arma el caso de uso con los tres puertos falseados. Por defecto todo sale bien,
 * así cada test solo tiene que romper la pieza que le interesa.
 */
const buildHarness = (options: {
    tenant?: ResolvedTenant | null;
    user?: AuthUserCredentials | null;
    passwordMatches?: boolean;
} = {}): Harness => {
    const tenant = 'tenant' in options ? options.tenant : activeTenant;
    const user = 'user' in options ? options.user : activeUser;
    const passwordMatches = options.passwordMatches ?? true;

    const findBySlug = jest.fn().mockResolvedValue(tenant);
    const findByUserName = jest.fn().mockResolvedValue(user);
    const verify = jest.fn().mockResolvedValue(passwordMatches);
    const verifyAgainstDummy = jest.fn().mockResolvedValue(undefined);

    const useCase = new LoginUseCase(
        { findBySlug },
        { findByUserName },
        { verify, verifyAgainstDummy },
    );

    return { useCase, findBySlug, findByUserName, verify, verifyAgainstDummy };
};


describe('LoginUseCase', () => {
    describe('resolución del negocio (tenant)', () => {
        it('normaliza el slug (trim + minúsculas) antes de resolverlo', async () => {
            const { useCase, findBySlug } = buildHarness();

            await useCase.execute({ ...validParams, tenantSlug: '  PanaderiA-Komi  ' });

            expect(findBySlug).toHaveBeenCalledWith('panaderia-komi');
        });


        it('lanza AuthTenantNotFoundException cuando el negocio no existe', async () => {
            const { useCase } = buildHarness({ tenant: null });

            await expect(useCase.execute(validParams)).rejects.toBeInstanceOf(
                AuthTenantNotFoundException,
            );
        });


        it('no busca al usuario cuando el negocio no existe', async () => {
            const { useCase, findByUserName } = buildHarness({ tenant: null });

            await expect(useCase.execute(validParams)).rejects.toThrow();

            expect(findByUserName).not.toHaveBeenCalled();
        });


        it('lanza InactiveTenantException cuando el negocio está inactivo', async () => {
            const { useCase } = buildHarness({ tenant: tenantWith({ isActive: false }) });

            await expect(useCase.execute(validParams)).rejects.toBeInstanceOf(
                InactiveTenantException,
            );
        });


        it('no busca al usuario cuando el negocio está inactivo', async () => {
            const { useCase, findByUserName } = buildHarness({
                tenant: tenantWith({ isActive: false }),
            });

            await expect(useCase.execute(validParams)).rejects.toThrow();

            expect(findByUserName).not.toHaveBeenCalled();
        });
    });


    describe('búsqueda del usuario', () => {
        it('busca al usuario con el id del negocio resuelto, no con el slug', async () => {
            const { useCase, findByUserName } = buildHarness();

            await useCase.execute(validParams);

            expect(findByUserName).toHaveBeenCalledWith(activeTenant.id, activeUser.userName);
        });


        it('hace trim al username antes de buscarlo', async () => {
            const { useCase, findByUserName } = buildHarness();

            await useCase.execute({ ...validParams, username: '   jperez   ' });

            expect(findByUserName).toHaveBeenCalledWith(activeTenant.id, 'jperez');
        });


        it('conserva las mayúsculas del username: la búsqueda es sensible a caso', async () => {
            const { useCase, findByUserName } = buildHarness();

            await useCase.execute({ ...validParams, username: 'JPerez' });

            expect(findByUserName).toHaveBeenCalledWith(activeTenant.id, 'JPerez');
        });


        it('lanza InvalidCredentialsException cuando el usuario no existe', async () => {
            const { useCase } = buildHarness({ user: null });

            await expect(useCase.execute(validParams)).rejects.toBeInstanceOf(
                InvalidCredentialsException,
            );
        });


        it('quema tiempo contra el hash dummy cuando el usuario no existe', async () => {
            const { useCase, verifyAgainstDummy } = buildHarness({ user: null });

            await expect(useCase.execute(validParams)).rejects.toThrow();

            expect(verifyAgainstDummy).toHaveBeenCalledWith(validParams.password);
        });


        it('no verifica contra un hash real cuando el usuario no existe', async () => {
            const { useCase, verify } = buildHarness({ user: null });

            await expect(useCase.execute(validParams)).rejects.toThrow();

            expect(verify).not.toHaveBeenCalled();
        });
    });


    describe('verificación de la contraseña', () => {
        it('verifica la contraseña plana contra el hash almacenado', async () => {
            const { useCase, verify } = buildHarness();

            await useCase.execute(validParams);

            expect(verify).toHaveBeenCalledWith(validParams.password, activeUser.passwordHash);
        });


        it('no hace trim a la contraseña', async () => {
            const { useCase, verify } = buildHarness();

            await useCase.execute({ ...validParams, password: '  con espacios  ' });

            expect(verify).toHaveBeenCalledWith('  con espacios  ', activeUser.passwordHash);
        });


        it('lanza InvalidCredentialsException cuando la contraseña no coincide', async () => {
            const { useCase } = buildHarness({ passwordMatches: false });

            await expect(useCase.execute(validParams)).rejects.toBeInstanceOf(
                InvalidCredentialsException,
            );
        });


        it('no llama al hash dummy cuando el usuario sí existe', async () => {
            const { useCase, verifyAgainstDummy } = buildHarness({ passwordMatches: false });

            await expect(useCase.execute(validParams)).rejects.toThrow();

            expect(verifyAgainstDummy).not.toHaveBeenCalled();
        });
    });


    describe('estado de la cuenta', () => {
        it('lanza InactiveAccountException si las credenciales son válidas pero la cuenta está inactiva', async () => {
            const { useCase } = buildHarness({ user: userWith({ isActive: false }) });

            await expect(useCase.execute(validParams)).rejects.toBeInstanceOf(
                InactiveAccountException,
            );
        });


        it('no revela que la cuenta está inactiva cuando la contraseña es incorrecta', async () => {
            const { useCase } = buildHarness({
                user: userWith({ isActive: false }),
                passwordMatches: false,
            });

            await expect(useCase.execute(validParams)).rejects.toBeInstanceOf(
                InvalidCredentialsException,
            );
        });


        it('verifica la contraseña antes de mirar el estado de la cuenta', async () => {
            const { useCase, verify } = buildHarness({ user: userWith({ isActive: false }) });

            await expect(useCase.execute(validParams)).rejects.toThrow(InactiveAccountException);

            expect(verify).toHaveBeenCalledTimes(1);
        });
    });


    describe('inicio de sesión exitoso', () => {
        it('devuelve el usuario mapeado junto a los campos de sesión', async () => {
            const { useCase } = buildHarness();

            const result = await useCase.execute(validParams);

            expect(result).toEqual({
                sessionToken: '',
                lastLogin: '',
                user: {
                    userId: activeUser.userId,
                    tenantId: activeUser.tenantId,
                    branchId: activeUser.branchId,
                    rolScope: activeUser.rolScope,
                    userName: activeUser.userName,
                    firstName: activeUser.firstName,
                    secondName: activeUser.secondName,
                    firstLastName: activeUser.firstLastName,
                    secondLastName: activeUser.secondLastName,
                    sex: activeUser.sex,
                },
            });
        });


        it('nunca expone el hash de la contraseña', async () => {
            const { useCase } = buildHarness();

            const result = await useCase.execute(validParams);

            expect(JSON.stringify(result)).not.toContain(activeUser.passwordHash);
            expect(result.user).not.toHaveProperty('passwordHash');
        });


        it('no expone el rolId ni el flag isActive', async () => {
            const { useCase } = buildHarness();

            const result = await useCase.execute(validParams);

            expect(result.user).not.toHaveProperty('rolId');
            expect(result.user).not.toHaveProperty('isActive');
        });


        it('conserva en null los campos opcionales vacíos', async () => {
            const { useCase } = buildHarness({
                user: userWith({ branchId: null, secondName: null, secondLastName: null }),
            });

            const result = await useCase.execute(validParams);

            expect(result.user.branchId).toBeNull();
            expect(result.user.secondName).toBeNull();
            expect(result.user.secondLastName).toBeNull();
        });
    });
});
