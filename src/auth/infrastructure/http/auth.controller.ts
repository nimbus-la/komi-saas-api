import { Body, Controller, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";

import { RefreshTokenCookie, ResponseMessage } from "@/infrastructure";

import { LoginUseCase, LogoutUseCase, RefreshSessionUseCase, toAuthTokensResponse } from "../../application";
import { UserLoginPayloadDto } from "./dto/user-payload.dto";
import { Public, RefreshToken } from "../decorators";
import { buildSessionContext } from "./session-context.factory";
import { RefreshTokenPayloadDto } from "./dto/refresh-token.dto";


/**
 * Puerta de entrada HTTP de la autenticación.
 *
 * No tiene lógica propia, solo recibe, delega y deja que el interceptor arme la
 * respuesta y el filtro traduzca las excepciones del dominio a códigos HTTP.
 */
@Controller("auth")
export class AuthController {
    constructor(
        private readonly login: LoginUseCase,
        private readonly refresh: RefreshSessionUseCase,
        private readonly logout: LogoutUseCase,
        private readonly refreshCookie: RefreshTokenCookie,
    ) { };

    /**
     * El DTO ya viene validado, y sus campos calzan uno a uno con LoginParams, así
     * que se pasa derecho al caso de uso sin armar nada intermedio.
     */
    @Public()
    @Post("login")
    @ResponseMessage("Inicio de sesión exitoso")
    public async signIn(
        @Body() dto: UserLoginPayloadDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {
        const { tokens, ...rest } = await this.login.execute(dto, buildSessionContext(req));

        this.refreshCookie.set(res, tokens.refreshToken);

        return { ...toAuthTokensResponse(tokens), ...rest };
    };


    @Public()
    @Post("refresh")
    @ResponseMessage("Sesión renovada exitosamente.")
    public async renew(
        @Body() _dto: RefreshTokenPayloadDto,
        @RefreshToken() refreshToken: string | null,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {
        const tokens = await this.refresh.execute(refreshToken, buildSessionContext(req));

        // La cookie se reemplaza en cada renovación porque el token rotó: la
        // anterior ya quedó canjeada en la base y no sirve para nada.
        this.refreshCookie.set(res, tokens.refreshToken);

        return toAuthTokensResponse(tokens);
    }


    @Public()
    @Post("logout")
    @ResponseMessage("La sesión se ha cerrado exitosamente")
    public async signOut(
        @Body() _dto: RefreshTokenPayloadDto,
        @RefreshToken() refreshToken: string | null,
        @Res({ passthrough: true }) res: Response
    ): Promise<void> {
        /**
         * Se borra la cookie SIEMPRE, incluso sin token que revocar. Si solo se
         * limpiara cuando hay algo que cerrar, el navegador se quedaría con una
         * cookie muerta que reintenta en cada arranque de la aplicación.
         *
         * Va antes de tocar la base a propósito: aunque la revocación falle, el
         * navegador ya no tiene el token.
         */
        this.refreshCookie.clear(res);

        await this.logout.execute(refreshToken);
    }
}
