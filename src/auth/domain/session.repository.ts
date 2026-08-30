import { Session } from "./session.aggregate";

export abstract class SessionRepository {
    abstract save(session: Session): Promise<void>;
    abstract findByRefreshTokenHash(hash: string): Promise<Session | null>;
    abstract revokeAllByUser(userId: string, reason: string, now: Date): Promise<void>;
}