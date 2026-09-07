import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { CookieOptions, Request, Response } from "express";

import { CookieConfig, JwtConfig } from "@/interfaces";
import { MILLISECONDS_PER_DAY, REFRESH_COOKIE_NAME, REFRESH_COOKIE_PATH } from "@/utils";


@Injectable()
export class RefreshTokenCookie {
    private readonly writeOptions: CookieOptions;
    private readonly clearOptions: CookieOptions;


    constructor(configService: ConfigService) {
        const cookie = configService.getOrThrow<CookieConfig>('cookie');
        const jwt = configService.getOrThrow<JwtConfig>('jwt');

        this.writeOptions = {
            httpOnly: true,
            secure: cookie.secure,
            sameSite: 'lax',
            path: REFRESH_COOKIE_PATH,
            domain: cookie.domain,
            maxAge: jwt.refreshTtlDays * MILLISECONDS_PER_DAY,
        };

        /**
         * Las mismas opciones pero SIN maxAge, y no es un detalle menor:
         * res.clearCookie borra fijando una fecha de expiración en el pasado,
         * pero si en las opciones va un maxAge, Express recalcula la fecha a
         * partir de él y la cookie se renueva en lugar de borrarse.
         */
        const { maxAge: _ignored, ...rest } = this.writeOptions;
        this.clearOptions = rest;
    }


    public set(response: Response, refreshToken: string): void {
        response.cookie(REFRESH_COOKIE_NAME, refreshToken, this.writeOptions);
    }


    public clear(response: Response): void {
        response.clearCookie(REFRESH_COOKIE_NAME, this.clearOptions);
    }


    public static read(request: Request): string | null {
        const value = request.cookies?.[REFRESH_COOKIE_NAME] as unknown;

        return typeof value === 'string' && value.length > 0
            ? value
            : null;
    }
}