import { Body, Controller, Post, UseFilters, UseInterceptors } from "@nestjs/common";
import { AllExceptionsFilter, ResponseInterceptor, ResponseMessage } from "@/infrastructure";

import { UserLoginPayloadDto } from "./dto/user-payload.dto";
import { LoginUseCase } from "@/auth/application";


@UseInterceptors(ResponseInterceptor)
@UseFilters(AllExceptionsFilter)
@Controller("auth")
export class AuthController {
    constructor(
        private readonly login: LoginUseCase
    ) { };

    @Post("login")
    @ResponseMessage("Inicio de sesión exitoso")
    public async signIn(@Body() dto: UserLoginPayloadDto) {
        return this.login.execute(dto);
    };


    @Post("logout")
    @ResponseMessage("La sesión se ha cerrado exitosamente")
    public async signOut(@Body() username: string) {
        return username;
    }
}