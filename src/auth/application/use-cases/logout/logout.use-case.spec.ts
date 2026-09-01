import { Session, SessionRevocationReason } from '../../../domain';
import { LogoutUseCase } from './logout.use-case';


/**
 * Pruebas del cierre de sesión.
 *
 * Es el caso de uso más corto del módulo y aun así tiene tres cosas que no se
 * ven a simple vista: nunca busca por el token en claro, calla ante un token que
 * no existe, y cierra UNA sesión, no todas las del usuario.
 */

const REFRESH_EN_CLARO = 'token-tal-como-lo-manda-el-cliente';
const HASH = 'sha256-del-token';

const AHORA = new Date('2026-01-01T12:00:00.000Z');


const buildSession = (): Session => Session.create({
    userId: '33333333-3333-4333-8333-333333333333',
    tenantId: '11111111-1111-4111-8111-111111111111',
    refreshTokenHash: HASH,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    ipAddress: null,
    userAgent: null,
});


interface Harness {
    useCase: LogoutUseCase;
    findByRefreshTokenHash: jest.Mock;
    update: jest.Mock;
    revokeAllByUser: jest.Mock;
    hash: jest.Mock;
}

const buildHarness = (options: { session?: Session | null } = {}): Harness => {
    const session = 'session' in options ? options.session : buildSession();

    const findByRefreshTokenHash = jest.fn().mockResolvedValue(session);
    const update = jest.fn().mockResolvedValue(undefined);
    const revokeAllByUser = jest.fn().mockResolvedValue(undefined);
    const hash = jest.fn().mockReturnValue(HASH);

    const useCase = new LogoutUseCase(
        {
            create: jest.fn(),
            update,
            findByRefreshTokenHash,
            findById: jest.fn(),
            revokeAllByUser,
            rotate: jest.fn(),
        },
        { generate: jest.fn(), hash },
    );

    return { useCase, findByRefreshTokenHash, update, revokeAllByUser, hash };
};


describe('LogoutUseCase', () => {
    describe('búsqueda de la sesión', () => {
        // En la base solo vive el hash del refresh, nunca su valor. Buscar por el
        // token en claro no encontraría nada jamás.
        it('hashea el token antes de buscarlo', async () => {
            const { useCase, hash, findByRefreshTokenHash } = buildHarness();

            await useCase.execute(REFRESH_EN_CLARO);

            expect(hash).toHaveBeenCalledWith(REFRESH_EN_CLARO);
            expect(findByRefreshTokenHash).toHaveBeenCalledWith(HASH);
        });
    });


    describe('cierre', () => {
        it('revoca la sesión indicando que fue un cierre de sesión', async () => {
            const { useCase, update } = buildHarness();

            await useCase.execute(REFRESH_EN_CLARO);

            const cerrada = (update.mock.calls[0] as [Session])[0];

            expect(cerrada.isRevoked()).toBe(true);
            expect(cerrada.getRevocationReason()).toBe(SessionRevocationReason.Logout);
        });


        /**
         * El motivo importa tanto como el hecho de revocar. La renovación lo mira
         * para separar un cierre normal de un refresh ya canjeado: si aquí saliera
         * ROTATED, presentar el token después se leería como robo y le cerraría al
         * usuario todas sus sesiones en todos sus dispositivos.
         */
        it('no lo marca como canjeado ni como robo', async () => {
            const { useCase, update } = buildHarness();

            await useCase.execute(REFRESH_EN_CLARO);

            const cerrada = (update.mock.calls[0] as [Session])[0];

            expect(cerrada.getRevocationReason()).not.toBe(SessionRevocationReason.Rotated);
            expect(cerrada.getRevocationReason()).not.toBe(SessionRevocationReason.ReuseDetected);
            expect(cerrada.toPrimitives().replacedBySessionId).toBeNull();
        });


        // Cerrar sesión en un dispositivo no debe echar al usuario de los demás.
        it('cierra solo esta sesión, no todas las del usuario', async () => {
            const { useCase, revokeAllByUser } = buildHarness();

            await useCase.execute(REFRESH_EN_CLARO);

            expect(revokeAllByUser).not.toHaveBeenCalled();
        });


        it('persiste el cambio', async () => {
            const { useCase, update } = buildHarness();

            await useCase.execute(REFRESH_EN_CLARO);

            expect(update).toHaveBeenCalledTimes(1);
        });
    });


    /**
     * Cerrar sesión tiene que salir bien siempre. El cliente ya borró el token de
     * su lado antes de que llegue la respuesta, así que un error aquí solo le deja
     * una pantalla de fallo sin nada que pueda hacer al respecto.
     */
    describe('token que no lleva a ninguna sesión', () => {
        it('no lanza cuando el token no existe', async () => {
            const { useCase } = buildHarness({ session: null });

            await expect(useCase.execute('token-inventado')).resolves.toBeUndefined();
        });


        it('no escribe nada cuando el token no existe', async () => {
            const { useCase, update, revokeAllByUser } = buildHarness({ session: null });

            await useCase.execute('token-inventado');

            expect(update).not.toHaveBeenCalled();
            expect(revokeAllByUser).not.toHaveBeenCalled();
        });


        /**
         * Repetir el cierre no cambia nada: el agregado conserva la primera
         * revocación. Importa porque un cliente que reintenta —o dos pestañas
         * cerrando a la vez— no debe alterar el motivo ni la fecha originales.
         */
        it('cerrar dos veces conserva el motivo y la fecha de la primera', async () => {
            const session = buildSession();
            session.revoke(SessionRevocationReason.Logout, AHORA);

            const { useCase, update } = buildHarness({ session });

            await useCase.execute(REFRESH_EN_CLARO);

            const cerrada = (update.mock.calls[0] as [Session])[0];

            expect(cerrada.getRevokedAt()).toBe(AHORA);
            expect(cerrada.getRevocationReason()).toBe(SessionRevocationReason.Logout);
        });
    });
});
