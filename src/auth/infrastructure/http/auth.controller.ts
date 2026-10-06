import { Body, Controller, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";

import { DomainException } from "@/shared";
import { ResponseMessage } from "@/infrastructure";

import { AuthTokens, LoginResponse, LoginUseCase, LogoutUseCase, RefreshSessionUseCase, SessionExpiration, toSessionExpiration } from "../../application";
import { UserLoginPayloadDto } from "./dto/user-payload.dto";
import { Public, RefreshToken } from "../decorators";
import { buildSessionContext } from "./session-context.factory";
import { SessionCookies } from "./session-cookies";


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
        private readonly cookies: SessionCookies,
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
    ): Promise<LoginResponse> {
        const { tokens, ...rest } = await this.login.execute(dto, buildSessionContext(req));

        this.cookies.set(res, tokens);
        return { ...toSessionExpiration(tokens), ...rest };
    };


    @Public()
    @Post("refresh")
    @ResponseMessage("Sesión renovada exitosamente.")
    public async renew(
        @RefreshToken() refreshToken: string | null,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ): Promise<SessionExpiration> {
        let tokens: AuthTokens;

        try {
            tokens = await this.refresh.execute(refreshToken, buildSessionContext(req));

        } catch (error: unknown) {
            if (error instanceof DomainException) {
                this.cookies.clear(res);
            }

            throw error;
        }

        // La cookie se reemplaza en cada renovación porque el token rotó: la
        // anterior ya quedó canjeada en la base y no sirve para nada.
        this.cookies.set(res, tokens);
        return toSessionExpiration(tokens);
    }


    @Public()
    @Post("logout")
    @ResponseMessage("La sesión se ha cerrado exitosamente")
    public async signOut(
        @RefreshToken() refreshToken: string | null,
        @Res({ passthrough: true }) res: Response
    ): Promise<void> {
        this.cookies.clear(res);
        await this.logout.execute(refreshToken);
    }
}
