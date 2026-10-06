import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { CookieOptions, Request, Response } from "express";

import { CookieConfig } from "@/interfaces";
import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME, SESSION_COOKIE_PATH } from "@/utils";
import { AuthTokens } from "../../application";


@Injectable()
export class SessionCookies {
    private readonly options: CookieOptions;


    constructor(configService: ConfigService) {
        const cookie = configService.getOrThrow<CookieConfig>('cookie');

        /**
         * Lax porque el front y la API viven en el mismo sitio. Así las cookies
         * cuentan como propias en todos los navegadores, y un POST que llegue
         * desde otro sitio no las lleva. Tampoco llevan dominio, de modo que cada
         * una queda atada al host de la API y no viaja a ningún otro subdominio.
         */
        this.options = {
            httpOnly: true,
            secure: cookie.secure,
            sameSite: 'lax',
            path: SESSION_COOKIE_PATH,
        };
    }


    public set(response: Response, tokens: AuthTokens): void {
        response.cookie(ACCESS_COOKIE_NAME, tokens.accessToken, {
            ...this.options,
            expires: tokens.accessExpiresAt,
        });

        response.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, {
            ...this.options,
            expires: tokens.refreshExpiresAt,
        });
    }


    public clear(response: Response): void {
        response.clearCookie(ACCESS_COOKIE_NAME, this.options);
        response.clearCookie(REFRESH_COOKIE_NAME, this.options);
    }


    public static readAccess(request: Request): string | null {
        return SessionCookies.read(request, ACCESS_COOKIE_NAME);
    }


    public static readRefresh(request: Request): string | null {
        return SessionCookies.read(request, REFRESH_COOKIE_NAME);
    }


    public static read(request: Request, name: string): string | null {
        const value = request.cookies?.[name] as unknown;

        return typeof value === 'string' && value.length > 0
            ? value
            : null;
    }
}