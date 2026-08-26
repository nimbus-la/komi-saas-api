import { Module } from "@nestjs/common";

import { Argon2PasswordVerifier, AuthController, AuthUserFinderAdapter, TenantResolverAdapter } from "./infrastructure";
import { AuthUserFinder, LoginUseCase, PasswordVerifier, TenantResolver } from "./application";
import { UserModule } from "@/context/user/user.module";
import { TenantModule } from "@/context/tenants/tenant.module";


@Module({
    imports: [
        UserModule,
        TenantModule
    ],
    controllers: [AuthController],
    providers: [
        {
            provide: TenantResolver,
            useClass: TenantResolverAdapter
        },

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
                tenantResolver: TenantResolver,
                userFinder: AuthUserFinder,
                passwordVerifier: PasswordVerifier,
            ) => new LoginUseCase(tenantResolver, userFinder, passwordVerifier),

            inject: [
                TenantResolver,
                AuthUserFinder,
                PasswordVerifier,
            ]
        }
    ],
    exports: []
})

export class AuthModule { };