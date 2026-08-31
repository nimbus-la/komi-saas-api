import { SessionRepository, SessionRevocationReason } from "../../../domain";
import { RefreshTokenGenerator } from "../../ports";

export class LogoutUseCase {
    constructor(
        private readonly sessions: SessionRepository,
        private readonly refreshGenerator: RefreshTokenGenerator
    ) { }


    public async execute(refreshToken: string): Promise<void> {
        const hash = this.refreshGenerator.hash(refreshToken);

        const session = await this.sessions.findByRefreshTokenHash(hash);

        if (session === null) return;

        session.revoke(SessionRevocationReason.Logout);

        await this.sessions.save(session);
    }
}