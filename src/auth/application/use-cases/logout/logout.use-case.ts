import { SessionRepository, SessionRevocationReason } from "../../../domain";
import { RefreshTokenGenerator } from "../../ports";

export class LogoutUseCase {
    constructor(
        private readonly sessions: SessionRepository,
        private readonly refreshGenerator: RefreshTokenGenerator
    ) { }


    public async execute(refreshToken: string | null): Promise<void> {
        /**
         * Sin token no hay nada que revocar, y eso NO es un error: la cookie pudo
         * haber expirado, el usuario pudo cerrar sesión dos veces, o simplemente
         * llegar aquí sin ella. En todos esos casos la sesión ya está cerrada,
         * que es justo lo que se pedía.
         *
         * Es el mismo criterio que se aplica más abajo a un token que no lleva a
         * ninguna sesión: cerrar sesión sale bien siempre. Devolver un error le
         * deja al front una pantalla de fallo ante algo que no puede arreglar,
         * y encima con la sesión ya cerrada.
         */
        if (refreshToken === null) return;

        const hash = this.refreshGenerator.hash(refreshToken);

        const session = await this.sessions.findByRefreshTokenHash(hash);

        if (session === null) return;

        session.revoke(SessionRevocationReason.Logout);

        await this.sessions.update(session);
    }
}