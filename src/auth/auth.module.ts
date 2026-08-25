import { Module } from "@nestjs/common";

import { Argon2PasswordVerifier, AuthController, AuthUserFinderAdapter } from "./infrastructure";
import { AuthUserFinder, LoginUseCase, PasswordVerifier } from "./application";
import { UserModule } from "@/context/user/user.module";


@Module({
    imports: [
        UserModule
    ],
    controllers: [AuthController],
    providers: [
        {
            provide: AuthUserFinder,
            useClass: AuthUserFinderAdapter
        },

        {
            provide: PasswordVerifier,
            useClass: Argon2PasswordVerifier
        },

        {
            provide: LoginUseCase,

            useFactory: (
                userFinder: AuthUserFinder,
                passwordVerifier: PasswordVerifier
            ) => new LoginUseCase(userFinder, passwordVerifier),

            inject: [
                AuthUserFinder,
                PasswordVerifier
            ]
        }
    ],
    exports: []
})

export class AuthModule { };