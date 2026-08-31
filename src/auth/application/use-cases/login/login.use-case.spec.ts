import {
    AuthTenantNotFoundException,
    InactiveAccountException,
    InactiveTenantException,
    InvalidCredentialsException,
} from '../../../domain';

import { AuthUserCredentials, LoginParams, ResolvedTenant, SessionContext } from '../../dtos';
import { LoginUseCase } from './login.use-case';


/**
 * Pruebas del caso de uso de login.
 *
 * Todo corre con los tres puertos falseados, sin base de datos ni argon2 de
 * verdad, porque lo que se prueba aquí es la coreografía: en qué orden se
 * consulta cada cosa, cuándo se corta y qué sale por el otro lado.
 *
 * Buena parte de los tests no verifican que el login funcione sino que no hable
 * de más. Ahí está la gracia de varios de ellos.
 */


/** Negocio sano, el punto de partida de todos los escenarios. */
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

/** Copia del negocio sano cambiando solo lo que al test le importa. */
const tenantWith = (overrides: Partial<ResolvedTenant>): ResolvedTenant => ({
    ...activeTenant,
    ...overrides,
});


/** Usuario sano, dentro del negocio de arriba. */
const activeUser: AuthUserCredentials = {
    userId: '3f1c9b6e-5a72-4d18-8c04-2b9e7a1d6f30',
    tenantId: activeTenant.id,
    branchId: 'b7a2c4d8-9e13-4f56-a0b1-2c3d4e5f6a7b',
    rolName: 'Cajero',
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

/** Lo mismo que tenantWith, pero para el usuario. */
const userWith = (overrides: Partial<AuthUserCredentials>): AuthUserCredentials => ({
    ...activeUser,
    ...overrides,
});


/** Credenciales que deberían funcionar siempre que nada más esté roto. */
const validParams: LoginParams = {
    tenantSlug: activeTenant.slug,
    username: activeUser.userName,
    password: 'Sup3rSecreta',
};


/** De dónde llegó la petición. El caso de uso solo lo copia a la sesión. */
const context: SessionContext = {
    ipAddress: '190.24.10.7',
    userAgent: 'Mozilla/5.0 (prueba)',
};


/** Días que vive el refresh en los tests. No es el valor real, es uno redondo. */
const REFRESH_TTL_DAYS = 7;

/** Lo que devuelve el generador de refresh, fijo para poder afirmar sobre él. */
const GENERATED_REFRESH = {
    plain: 'refresh-en-claro',
    hash: 'refresh-hasheado',
};

/** Lo que devuelve el emisor de JWT, también fijo. */
const ISSUED_ACCESS = {
    accessToken: 'access-token-firmado',
    expiresAt: new Date('2026-01-01T00:15:00.000Z'),
};


/** El caso de uso junto a sus mocks, para poder espiarlos desde el test. */
interface Harness {
    useCase: LoginUseCase;
    findBySlug: jest.Mock;
    findByUserName: jest.Mock;
    verify: jest.Mock;
    verifyAgainstDummy: jest.Mock;
    save: jest.Mock;
    issue: jest.Mock;
    generate: jest.Mock;
}

/**
 * Arma el caso de uso con todos sus puertos falseados. Por defecto todo sale bien,
 * así cada test solo tiene que romper la pieza que le interesa.
 */
const buildHarness = (options: {
    tenant?: ResolvedTenant | null;
    user?: AuthUserCredentials | null;
    passwordMatches?: boolean;
} = {}): Harness => {
    // Se pregunta por la clave y no por el valor porque null es una opción válida
    // aquí: pasar tenant en null significa "no existe", no "usá el de siempre".
    const tenant = 'tenant' in options ? options.tenant : activeTenant;
    const user = 'user' in options ? options.user : activeUser;
    const passwordMatches = options.passwordMatches ?? true;

    const findBySlug = jest.fn().mockResolvedValue(tenant);
    const findByUserName = jest.fn().mockResolvedValue(user);
    const findByUserId = jest.fn().mockResolvedValue(user);
    const verify = jest.fn().mockResolvedValue(passwordMatches);
    const verifyAgainstDummy = jest.fn().mockResolvedValue(undefined);

    const save = jest.fn().mockResolvedValue(undefined);
    const findByRefreshTokenHash = jest.fn().mockResolvedValue(null);
    const revokeAllByUser = jest.fn().mockResolvedValue(undefined);

    const issue = jest.fn().mockResolvedValue(ISSUED_ACCESS);
    const generate = jest.fn().mockReturnValue(GENERATED_REFRESH);
    const hash = jest.fn().mockReturnValue(GENERATED_REFRESH.hash);

    const useCase = new LoginUseCase(
        { findBySlug },
        { findByUserName, findByUserId },
        { verify, verifyAgainstDummy },
        { issue },
        { save, findByRefreshTokenHash, revokeAllByUser },
        { generate, hash },
        REFRESH_TTL_DAYS,
    );

    return { useCase, findBySlug, findByUserName, verify, verifyAgainstDummy, save, issue, generate };
};


describe('LoginUseCase', () => {
    /**
     * Primer paso del login. Si el negocio no está o está apagado, el caso de uso
     * ni siquiera debería asomarse a buscar al usuario.
     */
    describe('resolución del negocio (tenant)', () => {
        it('normaliza el slug (trim + minúsculas) antes de resolverlo', async () => {
            const { useCase, findBySlug } = buildHarness();

            await useCase.execute({ ...validParams, tenantSlug: '  PanaderiA-Komi  ' }, context);

            expect(findBySlug).toHaveBeenCalledWith('panaderia-komi');
        });


        it('lanza AuthTenantNotFoundException cuando el negocio no existe', async () => {
            const { useCase } = buildHarness({ tenant: null });

            await expect(useCase.execute(validParams, context)).rejects.toBeInstanceOf(
                AuthTenantNotFoundException,
            );
        });


        // Cortar aquí ahorra una consulta, pero sobre todo evita salir a buscar
        // usuarios con un tenantId que nunca se resolvió.
        it('no busca al usuario cuando el negocio no existe', async () => {
            const { useCase, findByUserName } = buildHarness({ tenant: null });

            await expect(useCase.execute(validParams, context)).rejects.toThrow();

            expect(findByUserName).not.toHaveBeenCalled();
        });


        it('lanza InactiveTenantException cuando el negocio está inactivo', async () => {
            const { useCase } = buildHarness({ tenant: tenantWith({ isActive: false }) });

            await expect(useCase.execute(validParams, context)).rejects.toBeInstanceOf(
                InactiveTenantException,
            );
        });


        it('no busca al usuario cuando el negocio está inactivo', async () => {
            const { useCase, findByUserName } = buildHarness({
                tenant: tenantWith({ isActive: false }),
            });

            await expect(useCase.execute(validParams, context)).rejects.toThrow();

            expect(findByUserName).not.toHaveBeenCalled();
        });
    });


    /**
     * Con qué se busca al usuario y qué pasa cuando no aparece. La normalización
     * de aquí es distinta a la del slug, y esa diferencia es a propósito.
     */
    describe('búsqueda del usuario', () => {
        // Dos negocios pueden tener un "admin" cada uno. Buscar por slug los
        // mezclaría, por eso va el id ya resuelto.
        it('busca al usuario con el id del negocio resuelto, no con el slug', async () => {
            const { useCase, findByUserName } = buildHarness();

            await useCase.execute(validParams, context);

            expect(findByUserName).toHaveBeenCalledWith(activeTenant.id, activeUser.userName);
        });


        it('hace trim al username antes de buscarlo', async () => {
            const { useCase, findByUserName } = buildHarness();

            await useCase.execute({ ...validParams, username: '   jperez   ' }, context);

            expect(findByUserName).toHaveBeenCalledWith(activeTenant.id, 'jperez');
        });


        // A diferencia del slug, aquí no se pasa a minúsculas. Si alguien cambia
        // eso, este test avisa.
        it('conserva las mayúsculas del username: la búsqueda es sensible a caso', async () => {
            const { useCase, findByUserName } = buildHarness();

            await useCase.execute({ ...validParams, username: 'JPerez' }, context);

            expect(findByUserName).toHaveBeenCalledWith(activeTenant.id, 'JPerez');
        });


        // La misma excepción que cuando la contraseña está mal, a propósito.
        it('lanza InvalidCredentialsException cuando el usuario no existe', async () => {
            const { useCase } = buildHarness({ user: null });

            await expect(useCase.execute(validParams, context)).rejects.toBeInstanceOf(
                InvalidCredentialsException,
            );
        });


        // Sin esto, esta rama respondería mucho más rápido que la del usuario que sí
        // existe, y con un cronómetro se irían descubriendo nombres válidos.
        it('quema tiempo contra el hash dummy cuando el usuario no existe', async () => {
            const { useCase, verifyAgainstDummy } = buildHarness({ user: null });

            await expect(useCase.execute(validParams, context)).rejects.toThrow();

            expect(verifyAgainstDummy).toHaveBeenCalledWith(validParams.password);
        });


        it('no verifica contra un hash real cuando el usuario no existe', async () => {
            const { useCase, verify } = buildHarness({ user: null });

            await expect(useCase.execute(validParams, context)).rejects.toThrow();

            expect(verify).not.toHaveBeenCalled();
        });
    });


    /** Qué se le pasa al verificador y qué se hace con su respuesta. */
    describe('verificación de la contraseña', () => {
        it('verifica la contraseña plana contra el hash almacenado', async () => {
            const { useCase, verify } = buildHarness();

            await useCase.execute(validParams, context);

            expect(verify).toHaveBeenCalledWith(validParams.password, activeUser.passwordHash);
        });


        // Los espacios pueden ser parte de la contraseña; recortarlos dejaría afuera
        // a quien la haya elegido así.
        it('no hace trim a la contraseña', async () => {
            const { useCase, verify } = buildHarness();

            await useCase.execute({ ...validParams, password: '  con espacios  ' }, context);

            expect(verify).toHaveBeenCalledWith('  con espacios  ', activeUser.passwordHash);
        });


        it('lanza InvalidCredentialsException cuando la contraseña no coincide', async () => {
            const { useCase } = buildHarness({ passwordMatches: false });

            await expect(useCase.execute(validParams, context)).rejects.toBeInstanceOf(
                InvalidCredentialsException,
            );
        });


        // El dummy es solo para el caso del usuario inexistente. Llamarlo también
        // aquí duplicaría el tiempo de un login fallido normal sin ganar nada.
        it('no llama al hash dummy cuando el usuario sí existe', async () => {
            const { useCase, verifyAgainstDummy } = buildHarness({ passwordMatches: false });

            await expect(useCase.execute(validParams, context)).rejects.toThrow();

            expect(verifyAgainstDummy).not.toHaveBeenCalled();
        });
    });


    /**
     * El último chequeo del login, y el más delicado de ubicar: contar que una
     * cuenta está inactiva solo es aceptable después de saber que quien pregunta
     * es realmente su dueño.
     */
    describe('estado de la cuenta', () => {
        it('lanza InactiveAccountException si las credenciales son válidas pero la cuenta está inactiva', async () => {
            const { useCase } = buildHarness({ user: userWith({ isActive: false }) });

            await expect(useCase.execute(validParams, context)).rejects.toBeInstanceOf(
                InactiveAccountException,
            );
        });


        // Cuenta inactiva más contraseña incorrecta tiene que verse igual que
        // cualquier otro intento fallido. Si saliera InactiveAccountException,
        // probando nombres al azar se sabría cuáles existen.
        it('no revela que la cuenta está inactiva cuando la contraseña es incorrecta', async () => {
            const { useCase } = buildHarness({
                user: userWith({ isActive: false }),
                passwordMatches: false,
            });

            await expect(useCase.execute(validParams, context)).rejects.toBeInstanceOf(
                InvalidCredentialsException,
            );
        });


        // Que verify se haya llamado prueba que el chequeo de isActive quedó
        // después y no antes, que es donde no debe estar.
        it('verifica la contraseña antes de mirar el estado de la cuenta', async () => {
            const { useCase, verify } = buildHarness({ user: userWith({ isActive: false }) });

            await expect(useCase.execute(validParams, context)).rejects.toThrow(InactiveAccountException);

            expect(verify).toHaveBeenCalledTimes(1);
        });
    });


    /**
     * El camino feliz. Más que revisar que devuelva los datos, estos tests vigilan
     * que no se cuele nada que no debería salir.
     */
    describe('inicio de sesión exitoso', () => {
        // Se compara el objeto completo con toEqual a propósito: cualquier campo
        // nuevo en la respuesta rompe el test y obliga a decidir a conciencia si
        // puede salir o no.
        it('devuelve el usuario mapeado junto a los campos de sesión', async () => {
            const { useCase } = buildHarness();

            const result = await useCase.execute(validParams, context);

            expect(result).toEqual({
                sessionToken: ISSUED_ACCESS.accessToken,
                expiredAt: ISSUED_ACCESS.expiresAt.toISOString(),
                refreshToken: GENERATED_REFRESH.plain,
                refreshExpiresAt: expect.any(String),
                lastLogin: '',
                user: {
                    userId: activeUser.userId,
                    tenantId: activeUser.tenantId,
                    branchId: activeUser.branchId,
                    rolName: activeUser.rolName,
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


        // Sale el refresh EN CLARO, nunca su hash: el hash es lo único que se
        // guarda, y confundirlos dejaría en la base un token utilizable.
        it('devuelve el refresh en claro y guarda solo su hash', async () => {
            const { useCase, save } = buildHarness();

            const result = await useCase.execute(validParams, context);

            expect(result.refreshToken).toBe(GENERATED_REFRESH.plain);
            expect(save.mock.calls[0]?.[0].toPrimitives().refreshTokenHash)
                .toBe(GENERATED_REFRESH.hash);
        });


        // El TTL se lee en DÍAS. Este test es el que atrapa que alguien vuelva a
        // multiplicar por 1000 en vez de por un día entero.
        it('calcula la expiración del refresh en días, no en segundos', async () => {
            const { useCase } = buildHarness();

            const antes = Date.now();
            const result = await useCase.execute(validParams, context);

            const vividos = new Date(result.refreshExpiresAt).getTime() - antes;
            const sieteDias = REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000;

            // El caso de uso mira el reloj DESPUÉS que el test, así que la vigencia
            // medida nunca es menor a la esperada; el margen cubre lo que tarde en
            // llegar hasta ahí. Con el bug de los segundos daba ~7000 ms y no 7 días.
            expect(vividos).toBeGreaterThanOrEqual(sieteDias);
            expect(vividos).toBeLessThan(sieteDias + 5000);
        });


        // El jti del access token es el id de la sesión recién guardada. Si se
        // separan, revocar la sesión deja de tener efecto sobre el token.
        it('firma el access token con el id de la sesión que acaba de guardar', async () => {
            const { useCase, save, issue } = buildHarness();

            await useCase.execute(validParams, context);

            const guardada = save.mock.calls[0]?.[0].getID().value;

            expect(issue).toHaveBeenCalledWith({
                userId: activeUser.userId,
                tenantId: activeUser.tenantId,
                branchId: activeUser.branchId,
                rolScope: activeUser.rolScope,
                sessionId: guardada,
            });
        });


        // La sesión tiene que quedar guardada ANTES de emitir el token: al revés,
        // un fallo al guardar dejaría circulando un access token sin sesión detrás.
        it('guarda la sesión antes de emitir el access token', async () => {
            const { useCase, save, issue } = buildHarness();

            await useCase.execute(validParams, context);

            expect(save.mock.invocationCallOrder[0])
                .toBeLessThan(issue.mock.invocationCallOrder[0]!);
        });


        it('registra en la sesión la IP y el user agent de la petición', async () => {
            const { useCase, save } = buildHarness();

            await useCase.execute(validParams, context);

            const guardada = save.mock.calls[0]?.[0].toPrimitives();

            expect(guardada.ipAddress).toBe(context.ipAddress);
            expect(guardada.userAgent).toBe(context.userAgent);
            expect(guardada.userId).toBe(activeUser.userId);
            expect(guardada.tenantId).toBe(activeUser.tenantId);
        });


        // Una sesión nace viva. Que arranque revocada o con motivo no sería un
        // detalle cosmético: el refresh la leería como reúso.
        it('crea la sesión sin revocar', async () => {
            const { useCase, save } = buildHarness();

            await useCase.execute(validParams, context);

            const guardada = save.mock.calls[0]?.[0].toPrimitives();

            expect(guardada.revokedAt).toBeNull();
            expect(guardada.revocationReason).toBeNull();
            expect(guardada.replacedBySessionId).toBeNull();
        });


        // Ninguna credencial fallida debe dejar rastro de sesión ni token emitido.
        it.each([
            ['el negocio no existe', { tenant: null }],
            ['el negocio está inactivo', { tenant: tenantWith({ isActive: false }) }],
            ['el usuario no existe', { user: null }],
            ['la contraseña no coincide', { passwordMatches: false }],
            ['la cuenta está inactiva', { user: userWith({ isActive: false }) }],
        ])('no crea sesión ni emite token cuando %s', async (_caso, options) => {
            const { useCase, save, issue, generate } = buildHarness(options);

            await expect(useCase.execute(validParams, context)).rejects.toThrow();

            expect(save).not.toHaveBeenCalled();
            expect(issue).not.toHaveBeenCalled();
            expect(generate).not.toHaveBeenCalled();
        });


        // Se revisa el JSON entero y no solo user, por si el hash termina colgado
        // en cualquier otro rincón de la respuesta.
        it('nunca expone el hash de la contraseña', async () => {
            const { useCase } = buildHarness();

            const result = await useCase.execute(validParams, context);

            expect(JSON.stringify(result)).not.toContain(activeUser.passwordHash);
            expect(result.user).not.toHaveProperty('passwordHash');
        });


        // El mapper copia campo a campo: del rol sale el nombre y el alcance, que
        // el front usa para pintar el menú, pero nunca el flag interno de estado.
        it('no expone el flag isActive ni el hash', async () => {
            const { useCase } = buildHarness();

            const result = await useCase.execute(validParams, context);

            expect(result.user).not.toHaveProperty('isActive');
            expect(result.user).not.toHaveProperty('passwordHash');
        });


        // Que sigan siendo null y no undefined ni cadena vacía: el front distingue
        // "no tiene" de "no vino".
        it('conserva en null los campos opcionales vacíos', async () => {
            const { useCase } = buildHarness({
                user: userWith({ branchId: null, secondName: null, secondLastName: null }),
            });

            const result = await useCase.execute(validParams, context);

            expect(result.user.branchId).toBeNull();
            expect(result.user.secondName).toBeNull();
            expect(result.user.secondLastName).toBeNull();
        });
    });
});
