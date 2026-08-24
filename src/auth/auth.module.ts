import { Module } from "@nestjs/common";

import { AuthController } from "./infrastructure";
import { LoginUseCase } from "./application";


@Module({
    imports: [],
    controllers: [AuthController],
    providers: [
        LoginUseCase
    ],
    exports: []
})

export class AuthModule { };