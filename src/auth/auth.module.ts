import { Module } from "@nestjs/common";

import { AuthController, AuthUserFinderAdapter } from "./infrastructure";
import { AuthUserFinder, LoginUseCase } from "./application";
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
            provide: LoginUseCase,
            useFactory: (userFinder: AuthUserFinder) => new LoginUseCase(userFinder),
            inject: [AuthUserFinder]
        }
    ],
    exports: []
})

export class AuthModule { };