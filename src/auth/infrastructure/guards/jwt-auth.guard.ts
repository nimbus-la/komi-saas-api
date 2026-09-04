import { Reflector } from "@nestjs/core";
import { JwtService, TokenExpiredError } from "@nestjs/jwt";
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { PinoLogger } from "nestjs-pino";

import { JWT_ALGORITHM, JWT_AUDIENCE, JWT_ISSUER } from "@/utils";

import { SessionRepository, SessionRevocationReason } from "../../domain";
import { AccessTokenPayload, AuthenticatedUser, RequestWithUser } from "../types";
import { IS_PUBLIC_KEY } from "../decorators";


@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly reflector: Reflector,
        private readonly sessions: SessionRepository,
        private readonly logger: PinoLogger
    ) {
        this.logger.setContext(JwtAuthGuard.name);
    }


    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass()
        ]);

        if (isPublic) return true;

        const request = context.switchToHttp().getRequest<RequestWithUser>();

        const token = this.extractBearerToken(request);

        if (token === null) {
            throw new UnauthorizedException('Se requiere un token de acceso');
        }

        const user = await this.verify(token);

        await this.ensureSessionIsUsable(user.sessionId);

        request.user = user;

        return true
    }


    /**
     * Comprueba contra la base que la sesión detrás del token siga en pie.
     *
     * Sin esto la firma era lo único que se miraba, así que cerrar sesión o dar de
     * baja a un usuario no surtía efecto hasta que el access token caducara solo:
     * hasta quince minutos de acceso pleno después de haberle cerrado la puerta. Y
     * cuando se detecta un token robado, esos quince minutos son del ladrón.
     *
     * Cuesta una consulta por clave primaria en cada petición. Es el precio de que
     * revocar signifique algo de verdad; el `jti` estaba en el token desde el
     * principio justamente para esto.
     */
    private async ensureSessionIsUsable(sessionId: string): Promise<void> {
        const session = await this.sessions.findById(sessionId);

        if (session === null) {
            throw new UnauthorizedException('La sesión ya no existe');
        }

        /**
         * ROTATED se deja pasar a propósito, y es la parte delicada.
         *
         * Al renovar, la sesión anterior queda marcada como canjeada, pero el
         * access token que se emitió con ella sigue siendo válido durante lo que le
         * quede de sus quince minutos. Rechazarlo aquí tumbaría las peticiones que
         * el cliente tuviera en vuelo en el momento justo de renovar, sin que nadie
         * haya hecho nada malo: renovar no es revocar.
         *
         * Los demás motivos —cierre de sesión, baja del usuario o del negocio,
         * reúso detectado— sí son cortes deliberados y tienen efecto inmediato.
         */
        const reason = session.getRevocationReason();

        if (reason !== null && reason !== SessionRevocationReason.Rotated) {
            throw new UnauthorizedException('La sesión fue cerrada');
        }
    }


    private extractBearerToken(request: RequestWithUser): string | null {
        const header = request.headers.authorization;

        if (typeof header !== 'string') return null;

        const [scheme, token] = header.split(' ');

        if (scheme?.toLowerCase() !== 'bearer' || !token) return null;

        return token;
    }


    private async verify(token: string): Promise<AuthenticatedUser> {
        let payload: AccessTokenPayload;

        try {
            /**
             * Los tres van explícitos, y los tres importan:
             *
             * - `algorithms` cierra la lista a HS256 en vez de aceptar la que traiga
             *   por defecto la librería.
             * - `issuer` y `audience` obligan a que el token lo hayamos emitido
             *   nosotros y para esta aplicación, así que uno firmado por otro
             *   sistema no entra ni compartiendo el secreto por accidente.
             */
            payload = await this.jwtService.verifyAsync<AccessTokenPayload>(token, {
                algorithms: [JWT_ALGORITHM],
                issuer: JWT_ISSUER,
                audience: JWT_AUDIENCE,
            });
        } catch (error: unknown) {
            /**
             * Al cliente se le responde lo mismo pase lo que pase, y así debe
             * seguir: distinguir "firma inválida" de "emisor incorrecto" le
             * regala información a quien esté probando tokens.
             *
             * Pero el motivo real se pierde, y no todos son un token malo: un
             * `JWT_SECRET` cambiado o un emisor mal configurado se ven
             * exactamente igual desde fuera —todo el mundo deslogueado, sin
             * una sola pista— hasta que alguien mira esta línea.
             */
            this.logger.debug({ err: error }, 'El token de acceso no superó la verificación');

            throw error instanceof TokenExpiredError
                ? new UnauthorizedException('El token de acceso expiró')
                : new UnauthorizedException('Token de acceso inválido');
        }

        return this.toAuthenticatedUser(payload);
    }


    private toAuthenticatedUser(payload: AccessTokenPayload): AuthenticatedUser {
        const { sub, tenantId, branchId, rolScope, jti } = payload;

        const isValid =
            typeof sub === 'string' &&
            typeof tenantId === 'string' &&
            typeof rolScope === 'string' &&
            typeof jti === 'string' &&
            (typeof branchId === 'string' || branchId === null);

        if (!isValid) {
            throw new UnauthorizedException('Token de acceso inválido');
        }

        return {
            userId: sub as string,
            tenantId: tenantId as string,
            branchId: branchId as string | null,
            rolScope: rolScope as string,
            sessionId: jti as string,
        }
    }
}