import { MILLISECONDS_PER_DAY } from "@/utils";

import { ExpiredRefreshTokenException, InvalidRefreshTokenException, RefreshTokenReuseDetectedException, Session, SessionRepository, SessionRevocationReason } from "../../../domain";

import { AuthTokens, SessionContext } from "../../dtos";
import { AuthUserFinder, RefreshTokenGenerator, TokenIssuer } from "../../ports";


/**
 * Cuánto se tolera que un refresh recién canjeado vuelva a aparecer antes de
 * tratarlo como robado. Cubre reintentos y peticiones en vuelo del mismo
 * cliente; un reúso malicioso llega mucho más tarde que esto.
 */
const ROTATION_GRACE_MS = 10_000;


export class RefreshSessionUseCase {
    constructor(
        private readonly sessions: SessionRepository,
        private readonly userFinder: AuthUserFinder,
        private readonly tokenIssuer: TokenIssuer,
        private readonly refreshGenerator: RefreshTokenGenerator,
        private readonly refreshTtlDays: number,
    ) { };


    /** Si el canje fue hace nada, quien repite es el propio cliente, no un ladrón. */
    private wasJustRotated(session: Session, now: Date = new Date()): boolean {
        const revokedAt = session.getRevokedAt();

        return revokedAt !== null
            && now.getTime() - revokedAt.getTime() < ROTATION_GRACE_MS;
    }


    public async execute(refreshToken: string, context: SessionContext): Promise<AuthTokens> {
        const hash = this.refreshGenerator.hash(refreshToken);

        const session = await this.sessions.findByRefreshTokenHash(hash);

        if (session === null) {
            throw new InvalidRefreshTokenException()
        }

        if (session.isRevoked()) {
            // Solo un refresh YA CANJEADO delata un robo: si esta sesión sigue viva
            // en algún lado es porque existen dos copias del mismo token. Las demás
            // revocaciones (un logout, una baja hecha por un administrador) son
            // cierres normales, y tratarlas como robo cerraría todas las sesiones
            // del usuario en todos sus dispositivos por, por ejemplo, un logout y un
            // refresh en vuelo desde otra pestaña.
            if (session.getRevocationReason() !== SessionRevocationReason.Rotated) {
                throw new InvalidRefreshTokenException();
            }

            // Recién canjeado: casi siempre es el mismo cliente repitiendo, no un
            // ladrón. Un doble clic, un reintento por timeout o dos pestañas que
            // renuevan a la vez mandan el mismo token dos veces con milisegundos de
            // diferencia, y la copia que llega tarde encuentra la sesión ya rotada.
            // Dar la alarma ahí cerraría todas las sesiones del usuario por usar la
            // aplicación con normalidad.
            //
            // Se pierde poco: quien llega dentro de la ventana tampoco obtiene
            // sesión, solo se ahorra el escándalo. Un ladrón de verdad se presenta
            // mucho después de que la víctima ya renovó, y ahí sí salta la alarma.
            if (this.wasJustRotated(session)) {
                throw new InvalidRefreshTokenException();
            }

            const userId = session.getUserId();

            await this.sessions.revokeAllByUser(
                userId,
                SessionRevocationReason.ReuseDetected,
                new Date()
            );

            throw new RefreshTokenReuseDetectedException(userId);
        }

        if (session.isExpired()) {
            throw new ExpiredRefreshTokenException();
        }

        const previous = session.toPrimitives();

        const user = await this.userFinder.findByUserId(previous.tenantId, previous.userId);

        if (user === null || !user.isActive) {
            await this.sessions.revokeAllByUser(
                previous.userId,
                SessionRevocationReason.Revoked,
                new Date()
            );

            throw new InvalidRefreshTokenException();
        }

        const generated = this.refreshGenerator.generate();
        const refreshExpiresAt = new Date(Date.now() + this.refreshTtlDays * MILLISECONDS_PER_DAY);

        const successor = Session.create({
            userId: user.userId,
            tenantId: user.tenantId,
            refreshTokenHash: generated.hash,
            expiresAt: refreshExpiresAt,
            ipAddress: context.ipAddress,
            userAgent: context.userAgent
        });

        session.rotateTo(successor.getID());

        const rotated = await this.sessions.rotate(session, successor);

        // Perder aquí significa que otra petición canjeó este mismo refresh en el
        // mismo instante. No se trata como robo: el token se usó UNA vez, que es
        // justo su límite, y quien pierde simplemente se queda sin sesión. Si de
        // verdad había dos copias, la segunda se presentará más tarde contra una
        // sesión ya marcada ROTATED y ahí sí saltará la detección de reúso.
        if (!rotated) {
            throw new InvalidRefreshTokenException();
        }

        const issued = await this.tokenIssuer.issue({
            userId: user.userId,
            tenantId: user.tenantId,
            branchId: user.branchId,
            rolScope: user.rolScope,
            sessionId: successor.getID().value
        });

        return {
            accessToken: issued.accessToken,
            accessExpiresAt: issued.expiresAt,
            refreshToken: generated.plain,
            refreshExpiresAt
        }
    }
}