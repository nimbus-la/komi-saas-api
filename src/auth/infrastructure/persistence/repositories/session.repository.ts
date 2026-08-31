import { Injectable } from "@nestjs/common";

import { IsNull, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

import { Session, SessionRepository } from "../../../domain";
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


    public async revokeAllByUser(userId: string, reason: string, now: Date): Promise<void> {
        await this.sessions.update(
            { userId, revokedAt: IsNull() },
            { revokedAt: now, revocationReason: reason }
        );
    }
}