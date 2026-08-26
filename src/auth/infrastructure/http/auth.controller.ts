import { Body, Controller, Post, UseFilters, UseInterceptors } from "@nestjs/common";
import { AllExceptionsFilter, ResponseInterceptor, ResponseMessage } from "@/infrastructure";

import { UserLoginPayloadDto } from "./dto/user-payload.dto";
import { LoginUseCase } from "@/auth/application";


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
        private readonly login: LoginUseCase
    ) { };

    /**
     * El DTO ya viene validado, y sus campos calzan uno a uno con LoginParams, así
     * que se pasa derecho al caso de uso sin armar nada intermedio.
     */
    @Post("login")
    @ResponseMessage("Inicio de sesión exitoso")
    public async signIn(@Body() dto: UserLoginPayloadDto) {
        return this.login.execute(dto);
    };


    /**
     * Todavía sin implementar. Devuelve lo que recibe para dejar la ruta en pie
     * mientras se define cómo se manejan las sesiones.
     */
    @Post("logout")
    @ResponseMessage("La sesión se ha cerrado exitosamente")
    public async signOut(@Body() username: string) {
        return username;
    }
}
