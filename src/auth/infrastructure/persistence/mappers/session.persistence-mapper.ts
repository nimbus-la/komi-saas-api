import { Session, SessionRevocationReason } from "../../../domain";
import { SessionModel } from "../models/session.model";

export class SessionPersistenceMapper {
    public static toPersistence(session: Session): SessionModel {
        return { ...session.toPrimitives() };
    }


    public static toAggregate(row: SessionModel): Session {
        return Session.fromPrimitives({
            ...row,
            revocationReason: row.revocationReason as SessionRevocationReason | null
        });
    }
}