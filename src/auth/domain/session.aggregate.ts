import { AggregateRoot } from "@/shared";

import { SessionId } from "./value-object";
import { SessionCreated, SessionPrimitives, SessionRevocationReason } from "./types";


/** Session abrierta. El estado presente de un refresh token */
export class Session extends AggregateRoot<SessionId> {
    private readonly userId: string;
    private readonly tenantId: string;
    private readonly refreshTokenHash: string;
    private readonly expiresAt: Date;
    private readonly createdAt: Date;
    private revokedAt: Date | null;
    private revocationReason: SessionRevocationReason | null;
    private replacedBySessionId: string | null;
    private readonly ipAddress: string | null;
    private readonly userAgent: string | null;


    private constructor(id: SessionId, params: SessionPrimitives) {
        super(id);

        this.userId = params.userId;
        this.tenantId = params.tenantId;
        this.refreshTokenHash = params.refreshTokenHash;
        this.expiresAt = params.expiresAt;
        this.createdAt = params.createdAt;
        this.revokedAt = params.revokedAt;
        this.revocationReason = params.revocationReason;
        this.replacedBySessionId = params.replacedBySessionId;
        this.ipAddress = params.ipAddress;
        this.userAgent = params.userAgent;
    }


    public static create(params: SessionCreated): Session {
        const id = SessionId.generate();

        return new Session(id, {
            id: id.value,
            userId: params.userId,
            tenantId: params.tenantId,
            refreshTokenHash: params.refreshTokenHash,
            expiresAt: params.expiresAt,
            createdAt: new Date(),
            revokedAt: null,
            revocationReason: null,
            replacedBySessionId: null,
            ipAddress: params.ipAddress,
            userAgent: params.userAgent,
        });
    }


    public isUsable(now: Date = new Date()): boolean {
        return this.revokedAt === null && this.expiresAt.getTime() > now.getTime();
    }


    public isRevoked(): boolean {
        return this.revokedAt !== null;
    }


    public isExpired(now: Date = new Date()): boolean {
        return this.expiresAt.getTime() <= now.getTime();
    }


    public getUserId(): string {
        return this.userId;
    }


    public revoke(reason: SessionRevocationReason, now: Date = new Date()): void {
        if (this.revokedAt !== null) return;

        this.revokedAt = now;
        this.revocationReason = reason;
    }


    public rotateTo(successor: SessionId, now: Date = new Date()): void {
        this.revoke(SessionRevocationReason.Rotated, now);
        this.replacedBySessionId = successor.value;
    }


    public toPrimitives(): SessionPrimitives {
        return {
            id: this.id.value,
            userId: this.userId,
            tenantId: this.tenantId,
            refreshTokenHash: this.refreshTokenHash,
            expiresAt: this.expiresAt,
            createdAt: this.createdAt,
            revokedAt: this.revokedAt,
            revocationReason: this.revocationReason,
            replacedBySessionId: this.replacedBySessionId,
            ipAddress: this.ipAddress,
            userAgent: this.userAgent,
        };
    }


    public static fromPrimitives(primitive: SessionPrimitives): Session {
        return new Session(SessionId.create(primitive.id), primitive);
    }
}