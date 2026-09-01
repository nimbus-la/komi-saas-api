import { MILLISECONDS_PER_DAY } from "@/utils";

import { Session, SessionRepository } from "../../domain";

import { AuthTokens, GeneratedRefreshToken, SessionContext } from "../dtos";
import { RefreshTokenGenerator, TokenIssuer } from "../ports";


/**
 * Lo mínimo que hace falta saber de alguien para abrirle una sesión.
 *
 * Es un recorte de AuthUserCredentials: aquí no pinta nada su contraseña ni su
 * nombre, solo lo que termina viajando dentro del access token.
 */
export interface SessionOwner {
    userId: string;
    tenantId: string;
    branchId: string | null;
    rolScope: string;
}


/**
 * Emite sesiones y los tokens que las acompañan.
 *
 * Existe porque el login y la renovación hacían exactamente lo mismo por
 * separado: generar el refresh, calcular su vigencia, armar la sesión, guardarla
 * y firmar el access token con su id. Cinco pasos duplicados en los que basta que
 * uno se desvíe para que las dos vías dejen de comportarse igual.
 *
 * Lo único que cambia entre ambas es cómo se persiste: el login inserta una
 * sesión nueva y la renovación canjea la anterior por su sucesora en una sola
 * operación atómica. Por eso hay dos métodos públicos y un solo cuerpo detrás.
 */
export class SessionIssuer {
    constructor(
        private readonly sessions: SessionRepository,
        private readonly tokenIssuer: TokenIssuer,
        private readonly refreshGenerator: RefreshTokenGenerator,
        private readonly refreshTtlDays: number,
    ) { }


    /** Sesión nueva desde cero. Es lo que ocurre al iniciar sesión. */
    public async start(owner: SessionOwner, context: SessionContext): Promise<AuthTokens> {
        const { session, generated } = this.build(owner, context);

        await this.sessions.create(session);

        return this.issueFor(session, owner, generated);
    }


    /**
     * Canjea una sesión por su sucesora y emite los tokens de esta última.
     *
     * Devuelve null cuando otra petición canjeó el mismo refresh en el mismo
     * instante. No es un error a lanzar desde aquí: quien llama es el que sabe qué
     * significa perder esa carrera y cómo contárselo al cliente.
     */
    public async rotate(
        previous: Session,
        owner: SessionOwner,
        context: SessionContext,
    ): Promise<AuthTokens | null> {
        const { session: successor, generated } = this.build(owner, context);

        previous.rotateTo(successor.getID());

        const won = await this.sessions.rotate(previous, successor);

        return won
            ? this.issueFor(successor, owner, generated)
            : null;
    }


    /**
     * Arma la sesión en memoria, sin tocar la base.
     *
     * El refresh en claro viaja aparte a propósito: la sesión solo guarda su
     * hash, así que este es el único momento en que existe el valor que se le
     * devuelve al cliente.
     */
    private build(
        owner: SessionOwner,
        context: SessionContext,
    ): { session: Session; generated: GeneratedRefreshToken } {
        const generated = this.refreshGenerator.generate();

        // La vigencia se lee en DÍAS. Multiplicar por el factor equivocado aquí
        // produce sesiones que caducan en segundos sin que nada falle.
        const expiresAt = new Date(Date.now() + this.refreshTtlDays * MILLISECONDS_PER_DAY);

        const session = Session.create({
            userId: owner.userId,
            tenantId: owner.tenantId,
            refreshTokenHash: generated.hash,
            expiresAt,
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
        });

        return { session, generated };
    }


    /**
     * Firma el access token contra la sesión que ya está guardada.
     *
     * El `jti` es el id de esa sesión, y esa es toda la razón por la que revocarla
     * puede surtir efecto sobre un token ya emitido: el guard lo usa para ir a
     * buscarla en cada petición.
     */
    private async issueFor(
        session: Session,
        owner: SessionOwner,
        generated: GeneratedRefreshToken,
    ): Promise<AuthTokens> {
        const issued = await this.tokenIssuer.issue({
            userId: owner.userId,
            tenantId: owner.tenantId,
            branchId: owner.branchId,
            rolScope: owner.rolScope,
            sessionId: session.getID().value,
        });

        return {
            accessToken: issued.accessToken,
            accessExpiresAt: issued.expiresAt,
            refreshToken: generated.plain,
            refreshExpiresAt: session.toPrimitives().expiresAt,
        };
    }
}
