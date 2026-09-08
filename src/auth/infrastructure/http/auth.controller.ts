import { Body, Controller, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";

import { DomainException } from "@/shared";
import { RefreshTokenCookie, ResponseMessage } from "@/infrastructure";

import { AuthTokens, LoginUseCase, LogoutUseCase, RefreshSessionUseCase, toAuthTokensResponse } from "../../application";
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
        let tokens: AuthTokens;

        try {
            tokens = await this.refresh.execute(refreshToken, buildSessionContext(req));
        } catch (error: unknown) {
            /**
             * Se borra SOLO ante un error del dominio. Ahí el token está muerto sin
             * vuelta atrás —no existe, expiró, ya se canjeó, o el negocio se dio de
             * baja— y dejar la cookie condena al navegador a reintentar con ella en
             * cada arranque de la aplicación, contra un token que jamás va a servir.
             *
             * Un fallo de infraestructura NO la borra, y la diferencia importa: si
             * la base se cayó, el token puede seguir siendo perfectamente válido.
             * Borrarlo ahí convierte una caída pasajera nuestra en la sesión perdida
             * del usuario, que es un daño que el error no pedía.
             */
            if (error instanceof DomainException) {
                this.refreshCookie.clear(res);
            }

            throw error;
        }

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
         * Va antes de tocar la base a propósito: aunque la revocación falle por
         * algo de infraestructura, el navegador ya se quedó sin el token. Aquí
         * sí se borra pase lo que pase, al revés que en la renovación: cerrar
         * sesión es exactamente lo que se está pidiendo, así que perder el token
         * ante un error no le quita al usuario nada que quisiera conservar.
         */
        this.refreshCookie.clear(res);

        await this.logout.execute(refreshToken);
    }
}
