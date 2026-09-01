import {
    ExpiredRefreshTokenException,
    InactiveTenantException,
    InvalidRefreshTokenException,
    RefreshTokenReuseDetectedException,
    Session,
    SessionRevocationReason,
} from '../../../domain';

import { AuthUserCredentials, ResolvedTenant, SessionContext } from '../../dtos';
import { SessionIssuer } from '../../services/session-issuer';
import { RefreshSessionUseCase } from './refresh-session.use-case';


/**
 * Pruebas de la renovación de sesión.
 *
 * Lo que se prueba aquí es cuándo se considera robo un refresh repetido y cuándo
 * no. Es la decisión más delicada del módulo: pasarse de estricto deja al usuario
 * fuera de todos sus dispositivos por un doble clic, y quedarse corto le regala
 * al ladrón una cadena de sesiones que no caduca nunca.
 */

const TENANT_ID = '11111111-1111-4111-8111-111111111111';
const USER_ID = '33333333-3333-4333-8333-333333333333';
const REFRESH_TTL_DAYS = 7;

const user: AuthUserCredentials = {
    userId: USER_ID,
    tenantId: TENANT_ID,
    branchId: null,
    rolName: 'Administrador',
    rolScope: 'ADMINISTRATIVE',
    userName: 'admin',
    firstName: 'Ada',
    secondName: null,
    firstLastName: 'Lovelace',
    secondLastName: null,
    sex: 'FEMALE',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$hash',
    isActive: true,
};

const context: SessionContext = { ipAddress: '190.24.10.7', userAgent: 'Mozilla/5.0' };

const ISSUED = { accessToken: 'access-firmado', expiresAt: new Date('2026-01-01T00:15:00.000Z') };
const GENERATED = { plain: 'refresh-nuevo', hash: 'hash-nuevo' };


/** Sesión viva, con una semana por delante. */
const buildSession = (): Session => Session.create({
    userId: USER_ID,
    tenantId: TENANT_ID,
    refreshTokenHash: 'hash-actual',
    expiresAt: new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000),
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
});


/**
 * Sesión ya revocada. `hace` son los milisegundos transcurridos desde el canje,
 * que es justo lo que decide si se trata como reintento o como robo.
 */
const revokedSession = (reason: SessionRevocationReason, hace = 0): Session => {
    const session = buildSession();
    session.revoke(reason, new Date(Date.now() - hace));

    return session;
};


/** El negocio al que pertenece la sesión, sano por defecto. */
const activeTenant: ResolvedTenant = {
    id: TENANT_ID,
    name: 'Panadería Komi',
    description: 'Negocio de prueba',
    slug: 'panaderia-komi',
    nit: '900123456-7',
    created_at: new Date('2026-01-01T00:00:00.000Z'),
    updated_at: new Date('2026-01-01T00:00:00.000Z'),
    isActive: true,
};


interface Harness {
    useCase: RefreshSessionUseCase;
    rotate: jest.Mock;
    revokeAllByUser: jest.Mock;
    issue: jest.Mock;
    findByUserId: jest.Mock;
}

const buildHarness = (options: {
    session?: Session | null;
    tenant?: ResolvedTenant | null;
    found?: AuthUserCredentials | null;
    rotateWins?: boolean;
} = {}): Harness => {
    const session = 'session' in options ? options.session : buildSession();
    const found = 'found' in options ? options.found : user;
    // Se pregunta por la clave y no por el valor: null significa "no existe".
    const tenant = 'tenant' in options ? options.tenant : activeTenant;

    const findByRefreshTokenHash = jest.fn().mockResolvedValue(session);
    const rotate = jest.fn().mockResolvedValue(options.rotateWins ?? true);
    const revokeAllByUser = jest.fn().mockResolvedValue(undefined);
    const save = jest.fn().mockResolvedValue(undefined);

    const findByUserId = jest.fn().mockResolvedValue(found);
    const issue = jest.fn().mockResolvedValue(ISSUED);

    const sessions = { create: save, update: jest.fn(), findByRefreshTokenHash, findById: jest.fn(), revokeAllByUser, rotate };
    const refreshGenerator = {
        generate: jest.fn().mockReturnValue(GENERATED),
        hash: jest.fn().mockReturnValue('hash-actual'),
    };

    // El emisor va de verdad: la rotación atómica es justo lo que estos tests
    // vigilan, y falsearlo dejaría sin comprobar quién llama a rotate y con qué.
    const sessionIssuer = new SessionIssuer(sessions, { issue }, refreshGenerator, REFRESH_TTL_DAYS);

    const useCase = new RefreshSessionUseCase(
        sessions,
        { findById: jest.fn().mockResolvedValue(tenant), findBySlug: jest.fn() },
        { findByUserId, findByUserName: jest.fn() },
        refreshGenerator,
        sessionIssuer,
    );

    return { useCase, rotate, revokeAllByUser, issue, findByUserId };
};


describe('RefreshSessionUseCase', () => {
    describe('renovación normal', () => {
        it('devuelve tokens nuevos y rota la sesión', async () => {
            const { useCase, rotate } = buildHarness();

            const result = await useCase.execute('refresh-actual', context);

            expect(result.accessToken).toBe(ISSUED.accessToken);
            expect(result.refreshToken).toBe(GENERATED.plain);
            expect(rotate).toHaveBeenCalledTimes(1);
        });


        // La sucesora es una sesión distinta, no la misma reescrita: así queda el
        // rastro de quién reemplazó a quién.
        it('marca la anterior como canjeada apuntando a la sucesora', async () => {
            const { useCase, rotate } = buildHarness();

            await useCase.execute('refresh-actual', context);

            const [previous, successor] = rotate.mock.calls[0] as [Session, Session];
            const canjeada = previous.toPrimitives();

            expect(canjeada.revocationReason).toBe(SessionRevocationReason.Rotated);
            expect(canjeada.replacedBySessionId).toBe(successor.getID().value);
            expect(successor.getID().value).not.toBe(previous.getID().value);
        });


        it('firma el access token con el id de la sesión sucesora', async () => {
            const { useCase, rotate, issue } = buildHarness();

            await useCase.execute('refresh-actual', context);

            const successor = (rotate.mock.calls[0] as [Session, Session])[1];

            expect(issue).toHaveBeenCalledWith(expect.objectContaining({
                sessionId: successor.getID().value,
            }));
        });
    });


    /**
     * El corazón del asunto. Un refresh que vuelve a aparecer puede ser un ladrón
     * o puede ser el mismo cliente reintentando, y la respuesta correcta es
     * distinta en cada caso.
     */
    describe('refresh repetido', () => {
        // Reúso de verdad: la copia aparece mucho después de que la víctima renovó.
        it('da la alarma cuando un canje viejo se vuelve a presentar', async () => {
            const { useCase, revokeAllByUser } = buildHarness({
                session: revokedSession(SessionRevocationReason.Rotated, 60_000),
            });

            await expect(useCase.execute('refresh-viejo', context))
                .rejects.toBeInstanceOf(RefreshTokenReuseDetectedException);

            expect(revokeAllByUser).toHaveBeenCalledWith(
                USER_ID,
                SessionRevocationReason.ReuseDetected,
                expect.any(Date),
            );
        });


        // Dentro de la ventana de gracia es el propio cliente: un doble clic, un
        // reintento por timeout, dos pestañas renovando a la vez. Cortar sí, pero
        // sin cerrarle todas las sesiones.
        it('no da la alarma cuando el canje fue hace un instante', async () => {
            const { useCase, revokeAllByUser } = buildHarness({
                session: revokedSession(SessionRevocationReason.Rotated, 500),
            });

            await expect(useCase.execute('refresh-actual', context))
                .rejects.toBeInstanceOf(InvalidRefreshTokenException);

            expect(revokeAllByUser).not.toHaveBeenCalled();
        });


        // Un logout no es un robo. Tratarlo como tal cerraría la sesión del usuario
        // en todos sus dispositivos por cerrarla en uno.
        it.each([
            SessionRevocationReason.Logout,
            SessionRevocationReason.Revoked,
            SessionRevocationReason.ReuseDetected,
        ])('no da la alarma cuando la sesión se revocó por %s', async (reason) => {
            const { useCase, revokeAllByUser } = buildHarness({
                session: revokedSession(reason, 60_000),
            });

            await expect(useCase.execute('refresh-cerrado', context))
                .rejects.toBeInstanceOf(InvalidRefreshTokenException);

            expect(revokeAllByUser).not.toHaveBeenCalled();
        });
    });


    /**
     * Cuando dos peticiones llegan con el mismo refresh, la base decide el ganador.
     * Aquí se comprueba qué hace el que pierde.
     */
    describe('carrera entre peticiones simultáneas', () => {
        // Un refresh vale por un canje. Quien pierde se queda sin sesión, pero no
        // se le trata como ladrón: nadie ha probado todavía que existan dos copias.
        it('deja sin sesión a quien pierde, sin dar la alarma', async () => {
            const { useCase, revokeAllByUser } = buildHarness({ rotateWins: false });

            await expect(useCase.execute('refresh-actual', context))
                .rejects.toBeInstanceOf(InvalidRefreshTokenException);

            expect(revokeAllByUser).not.toHaveBeenCalled();
        });


        // Lo importante: el perdedor no puede llevarse un access token igual.
        it('no emite access token cuando pierde la carrera', async () => {
            const { useCase, issue } = buildHarness({ rotateWins: false });

            await expect(useCase.execute('refresh-actual', context)).rejects.toThrow();

            expect(issue).not.toHaveBeenCalled();
        });
    });


    describe('sesiones que ya no sirven', () => {
        it('rechaza un refresh que no existe', async () => {
            const { useCase } = buildHarness({ session: null });

            await expect(useCase.execute('inventado', context))
                .rejects.toBeInstanceOf(InvalidRefreshTokenException);
        });


        it('rechaza un refresh expirado', async () => {
            const session = buildSession();
            session.revoke(SessionRevocationReason.Logout);
            const expired = Session.fromPrimitives({
                ...session.toPrimitives(),
                revokedAt: null,
                revocationReason: null,
                expiresAt: new Date(Date.now() - 1000),
            });

            const { useCase } = buildHarness({ session: expired });

            await expect(useCase.execute('vencido', context))
                .rejects.toBeInstanceOf(ExpiredRefreshTokenException);
        });


        /**
         * El negocio se vuelve a comprobar en cada renovación. Sin esto, darlo de
         * baja no serviría de nada: sus usuarios seguirían renovando la sesión
         * para siempre, porque el login —el único sitio donde se miraba— ya no
         * vuelve a ejecutarse.
         */
        it.each([
            ['el negocio está inactivo', { ...activeTenant, isActive: false }],
            ['el negocio ya no existe', null],
        ])('revoca todas las sesiones cuando %s', async (_caso, tenant) => {
            const { useCase, revokeAllByUser, issue } = buildHarness({ tenant });

            await expect(useCase.execute('refresh-actual', context))
                .rejects.toBeInstanceOf(InactiveTenantException);

            expect(revokeAllByUser).toHaveBeenCalledWith(
                USER_ID,
                SessionRevocationReason.Revoked,
                expect.any(Date),
            );
            expect(issue).not.toHaveBeenCalled();
        });


        // El negocio se mira ANTES que el usuario, igual que en el login. Que no se
        // haya buscado al usuario prueba que el corte ocurrió en el paso anterior.
        it('no busca al usuario cuando el negocio está inactivo', async () => {
            const { useCase, findByUserId } = buildHarness({
                tenant: { ...activeTenant, isActive: false },
            });

            await expect(useCase.execute('refresh-actual', context)).rejects.toThrow();

            expect(findByUserId).not.toHaveBeenCalled();
        });


        // Si al usuario lo dieron de baja mientras tenía la sesión abierta, no
        // alcanza con negarle esta renovación: hay que cerrarle todo lo que tenga.
        it.each([
            ['el usuario ya no existe', null],
            ['el usuario está inactivo', { ...user, isActive: false }],
        ])('revoca todas las sesiones cuando %s', async (_caso, found) => {
            const { useCase, revokeAllByUser, issue } = buildHarness({ found });

            await expect(useCase.execute('refresh-actual', context))
                .rejects.toBeInstanceOf(InvalidRefreshTokenException);

            expect(revokeAllByUser).toHaveBeenCalledWith(
                USER_ID,
                SessionRevocationReason.Revoked,
                expect.any(Date),
            );
            expect(issue).not.toHaveBeenCalled();
        });
    });
});
