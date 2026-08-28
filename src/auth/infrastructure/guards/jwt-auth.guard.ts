import { Reflector } from "@nestjs/core";
import { JwtService, TokenExpiredError } from "@nestjs/jwt";
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";

import { AccessTokenPayload, AuthenticatedUser, RequestWithUser } from "../types";
import { IS_PUBLIC_KEY } from "../decorators";


@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly reflector: Reflector
    ) { }


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

        request.user = await this.verify(token);

        return true
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
            payload = await this.jwtService.verifyAsync<AccessTokenPayload>(token);
        } catch (error: unknown) {
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