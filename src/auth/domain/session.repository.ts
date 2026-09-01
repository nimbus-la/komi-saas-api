import { Session } from "./session.aggregate";

import { SessionRevocationReason } from "./types";

export abstract class SessionRepository {
    abstract save(session: Session): Promise<void>;
    abstract findByRefreshTokenHash(hash: string): Promise<Session | null>;

    /**
     * La sesión que respalda un access token, buscada por el `jti` que lleva
     * dentro. La usa el guard en cada petición, así que va por la clave primaria.
     */
    abstract findById(sessionId: string): Promise<Session | null>;

    abstract revokeAllByUser(
        userId: string,
        reason: SessionRevocationReason,
        now: Date
    ): Promise<void>;

    /**
     * Guarda la rotación entera como UNA sola operación: la sesión anterior queda
     * canjeada y la sucesora nace, o no pasa ninguna de las dos cosas.
     *
     * La anterior solo se marca si en ese preciso instante seguía sin revocar. Ese
     * "si seguía" no se puede comprobar antes y confiar en él después: entre la
     * lectura y la escritura caben otras peticiones con el mismo token, y sin esta
     * condición todas creerían haber ganado y cada una se llevaría su propia
     * sesión. Un refresh vale por un canje, y quien decide cuál es el ganador es
     * la base de datos, no el orden en que lleguen las peticiones.
     *
     * Devuelve false cuando otra petición se adelantó; en ese caso no se escribe
     * nada y quien perdió se queda sin sesión.
     */
    abstract rotate(previous: Session, successor: Session): Promise<boolean>;
}