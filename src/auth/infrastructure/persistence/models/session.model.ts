import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: 'sessions' })
export class SessionModel {
    @PrimaryColumn({ name: 'session_id', type: 'uuid' })
    id!: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId!: string;

    @Column({ name: 'tenant_id', type: 'uuid' })
    tenantId!: string;

    @Column({ name: 'refresh_token_hash', type: 'varchar', length: 64, unique: true })
    refreshTokenHash!: string;

    @Column({ name: 'expires_at', type: 'timestamptz' })
    expiresAt!: Date;

    @Column({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;

    @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
    revokedAt!: Date | null;

    @Column({ name: 'revocation_reason', type: 'varchar', length: 20, nullable: true })
    revocationReason!: string | null;

    @Column({ name: 'replaced_by_session_id', type: 'uuid', nullable: true })
    replacedBySessionId!: string | null;

    @Column({ name: 'ip_address', type: 'inet', nullable: true })
    ipAddress!: string | null;

    @Column({ name: 'user_agent', type: 'varchar', length: 512, nullable: true })
    userAgent!: string | null;
}