import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

import { IssuedToken, SessionClaims, TokenIssuer } from "../../application";
import { JwtConfig } from "@/interfaces";


@Injectable()
export class JwtTokenIssuer implements TokenIssuer {
    private readonly accessTtlSeconds: number;


    constructor(
        private readonly jwtService: JwtService,
        public configService: ConfigService
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
                expiresIn: this.accessTtlSeconds
            }
        );

        return {
            accessToken,
            expiresAt: new Date(Date.now() + this.accessTtlSeconds * 1000)
        }
    }
}