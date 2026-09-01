import { Body, Controller, Post, Req, UseFilters, UseInterceptors } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import type { Request } from "express";

import { AllExceptionsFilter, ResponseInterceptor, ResponseMessage } from "@/infrastructure";
import { LOGIN_THROTTLE_LIMIT, LOGIN_THROTTLE_TTL_MS } from "@/utils";

import { LoginUseCase, LogoutUseCase, RefreshSessionUseCase } from "../../application";
import { UserLoginPayloadDto } from "./dto/user-payload.dto";
import { Public } from "../decorators";
import { buildSessionContext } from "./session-context.factory";
import { RefreshTokenPayloadDto } from "./dto/refresh-token.dto";


/**
 * Puerta de entrada HTTP de la autenticación.
 *
 * No tiene lógica propia, solo recibe, delega y deja que el interceptor arme la
 * respuesta y el filtro traduzca las excepciones del dominio a códigos HTTP.
 */
@UseInterceptors(ResponseInterceptor)
@UseFilters(AllExceptionsFilter)
@Controller("auth")
export class AuthController {
    constructor(
        private readonly login: LoginUseCase,
        private readonly refresh: RefreshSessionUseCase,
        private readonly logout: LogoutUseCase
    ) { };

    /**
     * El DTO ya viene validado, y sus campos calzan uno a uno con LoginParams, así
     * que se pasa derecho al caso de uso sin armar nada intermedio.
     */
    /**
     * Mucho más apretado que el resto de la API: es el único sitio donde se puede
     * adivinar una contraseña probando, y cada intento cuesta un argon2 de 64 MB,
     * así que sin tope sirve igual para forzar credenciales que para tumbar el
     * proceso por memoria.
     *
     * El conteo es por IP. Detrás de un proxy hay que configurar `trust proxy` en
     * main.ts o todas las peticiones contarán como una sola dirección.
     */
    @Public()
    @Throttle({ default: { ttl: LOGIN_THROTTLE_TTL_MS, limit: LOGIN_THROTTLE_LIMIT } })
    @Post("login")
    @ResponseMessage("Inicio de sesión exitoso")
    public async signIn(@Body() dto: UserLoginPayloadDto, @Req() req: Request) {
        return this.login.execute(dto, buildSessionContext(req));
    };


    @Public()
    @Post("refresh")
    @ResponseMessage("Sesión renovada exitosamente.")
    public async renew(@Body() dto: RefreshTokenPayloadDto, @Req() req: Request) {
        const tokens = await this.refresh.execute(dto.refreshToken, buildSessionContext(req));

        return {
            sessionToken: tokens.accessToken,
            expiredAt: tokens.accessExpiresAt.toISOString(),
            refreshToken: tokens.refreshToken,
            refreshExpiredAt: tokens.refreshExpiresAt.toISOString()
        };
    }


    /**
     * Todavía sin implementar. Devuelve lo que recibe para dejar la ruta en pie
     * mientras se define cómo se manejan las sesiones.
     */
    @Public()
    @Post("logout")
    @ResponseMessage("La sesión se ha cerrado exitosamente")
    public async signOut(@Body() dto: RefreshTokenPayloadDto): Promise<void> {
        await this.logout.execute(dto.refreshToken);
    }
}
