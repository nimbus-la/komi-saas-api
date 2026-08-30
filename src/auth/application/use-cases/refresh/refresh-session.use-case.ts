import { ExpiredRefreshTokenException, InvalidRefreshTokenException, RefreshTokenReuseDetectedException, Session, SessionRepository, SessionRevocationReason } from "../../../domain";

import { AuthTokens, SessionContext } from "../../dtos";
import { AuthUserFinder, RefreshTokenGenerator, TokenIssuer } from "../../ports";

export class RefreshSessionUseCase {
    constructor(
        private readonly sessions: SessionRepository,
        private readonly userFinder: AuthUserFinder,
        private readonly tokenIssuer: TokenIssuer,
        private readonly refreshGenerator: RefreshTokenGenerator,
        private readonly refreshTtlSeconds: number,
    ) { };


    public async execute(refreshToken: string, context: SessionContext): Promise<AuthTokens> {
        const hash = this.refreshGenerator.hash(refreshToken);

        const session = await this.sessions.findByRefreshTokenHash(hash);

        if (session === null) {
            throw new InvalidRefreshTokenException()
        }

        if (session.isRevoked()) {
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
        const refreshExpiresAt = new Date(Date.now() + this.refreshTtlSeconds * 1000);

        const successor = Session.create({
            userId: user.userId,
            tenantId: user.tenantId,
            refreshTokenHash: generated.hash,
            expiresAt: refreshExpiresAt,
            ipAddress: context.ipAddress,
            userAgent: context.userAgent
        });

        await this.sessions.save(successor);

        session.rotateTo(successor.getID());
        await this.sessions.save(session);

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