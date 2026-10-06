import { ConfigModule } from '@nestjs/config';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import cookieParser from 'cookie-parser';
import request from 'supertest';

import cookieConfig from '@/infrastructure/config/cookie.config';
import jwtConfig from '@/infrastructure/config/jwt.config';
import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME } from '@/utils';

import { AuthTokens, LoginUseCase, LogoutUseCase, RefreshSessionUseCase } from '../../application';
import { ExpiredRefreshTokenException, InvalidRefreshTokenException } from '../../domain';
import { AuthController } from './auth.controller';
import { SessionCookies } from './session-cookies';


/**
 * Lo que se prueba aquí es el contrato HTTP de la sesión, no las reglas: que los
 * dos tokens entren y salgan por cookies httpOnly y nunca por el JSON, y que las
 * cookies queden en el estado correcto también cuando la cosa sale mal.
 *
 * Los casos de uso van falseados a propósito. Sus reglas ya tienen sus propias
 * pruebas; lo que no estaba cubierto es esta capa.
 *
 * La aplicación se arma con el mismo cableado que main.ts, cookie-parser y el
 * ValidationPipe con forbidNonWhitelisted, porque un fallo en ese cableado no se
 * ve si el test lo omite.
 */

const ACCESS_FIRMADO = 'access-firmado';
const REFRESH_VIGENTE = 'refresh-que-trae-el-navegador';
const REFRESH_ROTADO = 'refresh-nuevo-tras-la-rotacion';

const buildTokens = (refreshToken: string): AuthTokens => ({
    accessToken: ACCESS_FIRMADO,
    accessExpiresAt: new Date(Date.now() + 900_000),
    refreshToken,
    refreshExpiresAt: new Date(Date.now() + 604_800_000),
});


/** El Set-Cookie de la cookie pedida, o null si la respuesta no lo trae. */
const setCookieOf = (res: request.Response, name: string): string | null => {
    const raw: unknown = res.headers['set-cookie'];
    const all = Array.isArray(raw) ? (raw as string[]) : typeof raw === 'string' ? [raw] : [];

    return all.find((cookie) => cookie.startsWith(`${name}=`)) ?? null;
};


/** Un Set-Cookie borra si viene sin valor y con la fecha en el pasado. */
const isDeletion = (header: string | null, name: string): boolean =>
    header !== null
    && header.startsWith(`${name}=;`)
    && header.includes('Expires=Thu, 01 Jan 1970');


/** Revisa que la respuesta borre las dos cookies de la sesión. */
const deletesBoth = (res: request.Response): boolean =>
    isDeletion(setCookieOf(res, ACCESS_COOKIE_NAME), ACCESS_COOKIE_NAME)
    && isDeletion(setCookieOf(res, REFRESH_COOKIE_NAME), REFRESH_COOKIE_NAME);


describe('AuthController (cookies httpOnly)', () => {
    let app: INestApplication;

    const loginExecute = jest.fn();
    const refreshExecute = jest.fn();
    const logoutExecute = jest.fn();

    beforeAll(async () => {
        // La cookie se marca Secure fuera de desarrollo, y con Secure el cliente
        // de pruebas no la vería sobre http plano.
        process.env['NODE_ENV'] = 'development';

        const moduleRef = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    ignoreEnvFile: true,
                    load: [cookieConfig, jwtConfig],
                }),
            ],
            controllers: [AuthController],
            providers: [
                SessionCookies,
                { provide: LoginUseCase, useValue: { execute: loginExecute } },
                { provide: RefreshSessionUseCase, useValue: { execute: refreshExecute } },
                { provide: LogoutUseCase, useValue: { execute: logoutExecute } },
            ],
        }).compile();

        app = moduleRef.createNestApplication();

        app.use(cookieParser());
        app.useGlobalPipes(
            new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })
        );

        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        jest.resetAllMocks();

        loginExecute.mockResolvedValue({
            tokens: buildTokens(REFRESH_VIGENTE),
            lastLogin: '',
            user: { userId: 'u-1' },
        });
        refreshExecute.mockResolvedValue(buildTokens(REFRESH_ROTADO));
        logoutExecute.mockResolvedValue(undefined);
    });


    describe('POST /auth/login', () => {
        it('deja los dos tokens en cookies httpOnly con path en la raíz', async () => {
            const res = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ username: 'ana', password: 'secreta', tenantSlug: 'komi' });

            const access = setCookieOf(res, ACCESS_COOKIE_NAME);
            const refresh = setCookieOf(res, REFRESH_COOKIE_NAME);

            expect(access).toContain(`${ACCESS_COOKIE_NAME}=${ACCESS_FIRMADO}`);
            expect(refresh).toContain(`${REFRESH_COOKIE_NAME}=${REFRESH_VIGENTE}`);

            for (const cookie of [access, refresh]) {
                expect(cookie).toContain('HttpOnly');
                expect(cookie).toContain('Path=/;');
            }
        });


        // Es el motivo de las cookies: si algún token sigue en el JSON, cualquier
        // script de la página lo lee y la cookie no protege de nada.
        it('responde solo los vencimientos y el usuario, sin tokens', async () => {
            const res = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ username: 'ana', password: 'secreta', tenantSlug: 'komi' });

            const body = JSON.stringify(res.body);

            expect(body).not.toContain(ACCESS_FIRMADO);
            expect(body).not.toContain(REFRESH_VIGENTE);
            expect(res.body).toHaveProperty('accessExpiresAt');
            expect(res.body).toHaveProperty('refreshExpiresAt');
            expect(res.body).toHaveProperty('user');
        });
    });


    describe('POST /auth/refresh', () => {
        it('renueva con la cookie y sin cuerpo', async () => {
            const res = await request(app.getHttpServer())
                .post('/auth/refresh')
                .set('Cookie', `${REFRESH_COOKIE_NAME}=${REFRESH_VIGENTE}`);

            expect(res.status).toBe(201);
            expect(refreshExecute).toHaveBeenCalledWith(REFRESH_VIGENTE, expect.any(Object));
        });


        it('reemplaza las dos cookies y no devuelve tokens en el cuerpo', async () => {
            const res = await request(app.getHttpServer())
                .post('/auth/refresh')
                .set('Cookie', `${REFRESH_COOKIE_NAME}=${REFRESH_VIGENTE}`);

            expect(setCookieOf(res, ACCESS_COOKIE_NAME)).toContain(`${ACCESS_COOKIE_NAME}=${ACCESS_FIRMADO}`);
            expect(setCookieOf(res, REFRESH_COOKIE_NAME)).toContain(`${REFRESH_COOKIE_NAME}=${REFRESH_ROTADO}`);

            const body = JSON.stringify(res.body);

            expect(body).not.toContain(ACCESS_FIRMADO);
            expect(body).not.toContain(REFRESH_ROTADO);
        });


        // El respaldo por cuerpo se retiró: un refresh que llegue ahí se ignora.
        it('ignora un refresh mandado en el cuerpo', async () => {
            refreshExecute.mockRejectedValue(new InvalidRefreshTokenException());

            await request(app.getHttpServer())
                .post('/auth/refresh')
                .send({ refreshToken: REFRESH_VIGENTE });

            expect(refreshExecute).toHaveBeenCalledWith(null, expect.any(Object));
        });


        describe('cuando el refresh ya no sirve', () => {
            // Sin esto el navegador guarda cookies muertas y las reintenta en cada
            // arranque, contra un token que no va a servir nunca más.
            it.each([
                ['inválido', new InvalidRefreshTokenException()],
                ['expirado', new ExpiredRefreshTokenException()],
            ])('borra las dos cookies si el token está %s', async (_caso, error) => {
                refreshExecute.mockRejectedValue(error);

                const res = await request(app.getHttpServer())
                    .post('/auth/refresh')
                    .set('Cookie', `${REFRESH_COOKIE_NAME}=${REFRESH_VIGENTE}`);

                expect(deletesBoth(res)).toBe(true);
            });


            /**
             * La contracara, y el motivo de que no se borren siempre: si lo que
             * falló fue la base, el token puede seguir siendo válido. Borrarlo ahí
             * saca al usuario de su sesión por una caída que no es culpa suya.
             */
            it('no borra nada si lo que falla es la infraestructura', async () => {
                refreshExecute.mockRejectedValue(new Error('la base no responde'));

                const res = await request(app.getHttpServer())
                    .post('/auth/refresh')
                    .set('Cookie', `${REFRESH_COOKIE_NAME}=${REFRESH_VIGENTE}`);

                expect(res.headers['set-cookie']).toBeUndefined();
            });
        });


        it('sin cookie, el caso de uso recibe null y decide', async () => {
            refreshExecute.mockRejectedValue(new InvalidRefreshTokenException());

            await request(app.getHttpServer()).post('/auth/refresh');

            expect(refreshExecute).toHaveBeenCalledWith(null, expect.any(Object));
        });
    });


    describe('POST /auth/logout', () => {
        it('revoca con el refresh de la cookie y borra las dos', async () => {
            const res = await request(app.getHttpServer())
                .post('/auth/logout')
                .set('Cookie', `${REFRESH_COOKIE_NAME}=${REFRESH_VIGENTE}`);

            expect(logoutExecute).toHaveBeenCalledWith(REFRESH_VIGENTE);
            expect(deletesBoth(res)).toBe(true);
        });


        /**
         * Cerrar sesión sin sesión no es un error: el resultado que se pedía ya
         * está. Un 4xx aquí le deja al front una pantalla de fallo sobre algo que
         * no puede arreglar, y encima con el usuario ya fuera.
         */
        it('sale bien sin cookies, y borra igual', async () => {
            const res = await request(app.getHttpServer()).post('/auth/logout');

            expect(res.status).toBe(201);
            expect(logoutExecute).toHaveBeenCalledWith(null);
            expect(deletesBoth(res)).toBe(true);
        });


        // Las cookies se borran antes de tocar la base: si la revocación revienta,
        // el navegador ya se quedó sin los tokens de todos modos.
        it('borra las cookies aunque la revocación falle', async () => {
            logoutExecute.mockRejectedValue(new Error('la base no responde'));

            const res = await request(app.getHttpServer())
                .post('/auth/logout')
                .set('Cookie', `${REFRESH_COOKIE_NAME}=${REFRESH_VIGENTE}`);

            expect(res.status).toBe(500);
            expect(deletesBoth(res)).toBe(true);
        });
    });
});
