import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

import { IssuedToken, SessionClaims, TokenIssuer } from "../../application";
import { JwtConfig } from "@/interfaces";
import { JWT_AUDIENCE, JWT_ISSUER } from "@/utils";


@Injectable()
export class JwtTokenIssuer implements TokenIssuer {
    private readonly accessTtlSeconds: number;


    // El ConfigService no lleva modificador a propósito: solo hace falta aquí
    // dentro para leer la vigencia, y guardarlo como propiedad sería dejar
    // colgada una dependencia que nadie más usa.
    constructor(
        private readonly jwtService: JwtService,
        configService: ConfigService
    ) {
        this.accessTtlSeconds = configService.getOrThrow<JwtConfig>('jwt').accessTtlSeconds;
    }


    public async issue(claims: SessionClaims): Promise<IssuedToken> {
        const accessToken = await this.jwtService.signAsync(
            {
                sub: claims.userId,
                tenantId: claims.tenantId,
                branchId: claims.branchId,
                rolScope: claims.rolScope
            },
            {
                jwtid: claims.sessionId,
                expiresIn: this.accessTtlSeconds,
                // Quedan dentro del token como `iss` y `aud`. El guard exige los dos
                // al verificar, así que un token ajeno no entra aunque su firma
                // cuadrara.
                issuer: JWT_ISSUER,
                audience: JWT_AUDIENCE
            }
        );

        return {
            accessToken,
            expiresAt: new Date(Date.now() + this.accessTtlSeconds * 1000)
        }
    }
}