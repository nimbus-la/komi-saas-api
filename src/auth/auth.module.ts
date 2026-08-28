import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Module } from "@nestjs/common";

import { JwtConfig } from "@/interfaces";
import { Argon2PasswordVerifier, AuthController, AuthUserFinderAdapter, JwtTokenIssuer, TenantResolverAdapter } from "./infrastructure";
import { AuthUserFinder, LoginUseCase, PasswordVerifier, TenantResolver, TokenIssuer } from "./application";
import { UserModule } from "@/context/user/user.module";
import { TenantModule } from "@/context/tenants/tenant.module";


/**
 * Aquí se amarran los puertos de la aplicación con sus implementaciones reales.
 *
 * Se importan los módulos de usuarios y de negocios porque los adaptadores viven
 * de sus repositorios. No se exporta nada: por ahora el único que usa este módulo
 * es su propio controlador.
 */
@Module({
    imports: [
        UserModule,
        TenantModule,

        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.getOrThrow<JwtConfig>('jwt').secret
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [
        // Cada puerto se registra usando la clase abstracta como token. Así el caso
        // de uso pide el puerto y recibe el adaptador sin enterarse de cuál es.
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
            provide: TokenIssuer,
            useClass: JwtTokenIssuer
        },

        // El caso de uso es una clase limpia, sin decoradores de Nest, para poder
        // probarlo con dobles. Por eso se arma a mano con una factory en vez de
        // dejar que el contenedor lo instancie solo.
        {
            provide: LoginUseCase,

            useFactory: (
                tenantResolver: TenantResolver,
                userFinder: AuthUserFinder,
                passwordVerifier: PasswordVerifier,
                tokenIssuer: TokenIssuer
            ) => new LoginUseCase(tenantResolver, userFinder, passwordVerifier, tokenIssuer),

            // El orden tiene que coincidir con el de los parámetros de la factory.
            inject: [
                TenantResolver,
                AuthUserFinder,
                PasswordVerifier,
                TokenIssuer
            ]
        }
    ],
    exports: []
})

export class AuthModule { };
