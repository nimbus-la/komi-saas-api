import { Injectable } from "@nestjs/common";

import { IsNull, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

import { Session, SessionRepository, SessionRevocationReason } from "../../../domain";
import { SessionModel } from "../models/session.model";
import { SessionPersistenceMapper } from "../mappers/session.persistence-mapper";


@Injectable()
export class TypeOrmSessionRepository implements SessionRepository {
    constructor(
        @InjectRepository(SessionModel)
        private readonly sessions: Repository<SessionModel>
    ) { }


    public async save(session: Session): Promise<void> {
        await this.sessions.save(SessionPersistenceMapper.toPersistence(session));
    }


    public async findByRefreshTokenHash(hash: string): Promise<Session | null> {
        const row = await this.sessions.findOne({ where: { refreshTokenHash: hash } });

        return row === null
            ? null
            : SessionPersistenceMapper.toAggregate(row);
    }


    public async revokeAllByUser(
        userId: string,
        reason: SessionRevocationReason,
        now: Date
    ): Promise<void> {
        await this.sessions.update(
            { userId, revokedAt: IsNull() },
            { revokedAt: now, revocationReason: reason }
        );
    }


    /**
     * Las dos escrituras van en una transacción para que no quede una sucesora
     * huérfana si la segunda falla.
     *
     * El `revoked_at IS NULL` del WHERE es lo que decide el ganador: Postgres
     * serializa los UPDATE sobre la misma fila, así que de varias peticiones
     * simultáneas con el mismo refresh token solo una encuentra la sesión sin
     * revocar y afecta a una fila. Las demás afectan a cero y salen sin escribir.
     *
     * Se actualiza primero y se inserta después, a propósito: así quien pierde la
     * carrera ni siquiera llega a crear la sucesora.
     */
    public async rotate(previous: Session, successor: Session): Promise<boolean> {
        const canjeada = previous.toPrimitives();

        return this.sessions.manager.transaction(async (manager) => {
            const result = await manager.update(
                SessionModel,
                { id: canjeada.id, revokedAt: IsNull() },
                {
                    revokedAt: canjeada.revokedAt,
                    revocationReason: canjeada.revocationReason,
                    replacedBySessionId: canjeada.replacedBySessionId
                }
            );

            if (result.affected !== 1) return false;

            await manager.insert(
                SessionModel,
                SessionPersistenceMapper.toPersistence(successor)
            );

            return true;
        });
    }
}