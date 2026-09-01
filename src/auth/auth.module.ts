import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";

import { JwtConfig } from "@/interfaces";
import { UserModule } from "@/context/user/user.module";
import { TenantModule } from "@/context/tenants/tenant.module";

import { SessionRepository } from "./domain";
import { Argon2PasswordVerifier, AuthController, AuthUserFinderAdapter, JwtAuthGuard, JwtTokenIssuer, TenantScopeGuard, SessionModel, Sha256RefreshTokenGenerator, TenantResolverAdapter, TypeOrmSessionRepository } from "./infrastructure";
import { AuthUserFinder, LoginUseCase, LogoutUseCase, PasswordVerifier, RefreshSessionUseCase, RefreshTokenGenerator, SessionIssuer, TenantResolver, TokenIssuer } from "./application";


/**
 * Aquí se amarran los puertos de la aplicación con sus implementaciones reales.
 *
 * Se importan los módulos de usuarios y de negocios porque los adaptadores viven
 * de sus repositorios. No se exporta nada: por ahora el único que usa este módulo
 * es su propio controlador.
 */
@Module({
    imports: [
        TypeOrmModule.forFeature([SessionModel]),
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
        // El orden importa: los guards globales corren en el orden en que se
        // registran, y el de tenant necesita el request.user que deja el de JWT.
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard
        },

        {
            provide: APP_GUARD,
            useClass: TenantScopeGuard
        },

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

        {
            provide: RefreshTokenGenerator,
            useClass: Sha256RefreshTokenGenerator,
        },

        {
            provide: SessionRepository,
            useClass: TypeOrmSessionRepository
        },

        // Abrir una sesión y firmar sus tokens es idéntico en el login y en la
        // renovación, así que vive aquí y los dos casos de uso lo reciben ya armado.
        {
            provide: SessionIssuer,

            useFactory: (
                sessions: SessionRepository,
                tokenIssuer: TokenIssuer,
                refreshGenerator: RefreshTokenGenerator,
                configService: ConfigService
            ) => new SessionIssuer(
                sessions,
                tokenIssuer,
                refreshGenerator,
                configService.getOrThrow<JwtConfig>('jwt').refreshTtlDays
            ),

            inject: [SessionRepository, TokenIssuer, RefreshTokenGenerator, ConfigService]
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
                sessionIssuer: SessionIssuer
            ) => new LoginUseCase(
                tenantResolver,
                userFinder,
                passwordVerifier,
                sessionIssuer
            ),

            // El orden tiene que coincidir con el de los parámetros de la factory.
            inject: [
                TenantResolver,
                AuthUserFinder,
                PasswordVerifier,
                SessionIssuer
            ]
        },

        {
            provide: RefreshSessionUseCase,

            useFactory: (
                sessions: SessionRepository,
                tenantResolver: TenantResolver,
                userFinder: AuthUserFinder,
                refreshGenerator: RefreshTokenGenerator,
                sessionIssuer: SessionIssuer
            ) => new RefreshSessionUseCase(
                sessions,
                tenantResolver,
                userFinder,
                refreshGenerator,
                sessionIssuer
            ),

            // El orden tiene que coincidir con el de los parámetros de la factory.
            inject: [
                SessionRepository,
                TenantResolver,
                AuthUserFinder,
                RefreshTokenGenerator,
                SessionIssuer,
            ]
        },

        {
            provide: LogoutUseCase,
            useFactory: (sessions: SessionRepository, refreshGenerator: RefreshTokenGenerator) => new LogoutUseCase(sessions, refreshGenerator),
            inject: [SessionRepository, RefreshTokenGenerator]
        }
    ],
    exports: []
})

export class AuthModule { };
