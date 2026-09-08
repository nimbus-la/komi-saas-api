import { ConfigModule } from '@nestjs/config';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import cookieParser from 'cookie-parser';
import request from 'supertest';

import { RefreshTokenCookie } from '@/infrastructure';
import cookieConfig from '@/infrastructure/config/cookie.config';
import jwtConfig from '@/infrastructure/config/jwt.config';

import { AuthTokens, LoginUseCase, LogoutUseCase, RefreshSessionUseCase } from '../../application';
import { ExpiredRefreshTokenException, InvalidRefreshTokenException } from '../../domain';
import { AuthController } from './auth.controller';


/**
 * Lo que se prueba aquí es el contrato HTTP de la sesión, no las reglas: que el
 * refresh token entre y salga por la cookie httpOnly y nunca por el JSON, y que
 * la cookie quede en el estado correcto también cuando la cosa sale mal.
 *
 * Los casos de uso van falseados a propósito. Sus reglas ya tienen sus propias
 * pruebas; lo que no estaba cubierto es esta capa, que es justo donde vivían los
 * errores que dejaban el flujo de cookies sin funcionar.
 *
 * La aplicación se arma con el MISMO cableado que `main.ts` —cookie-parser y el
 * ValidationPipe con `forbidNonWhitelisted`— porque uno de esos fallos no estaba
 * en el controlador sino en ese cableado, y un test que lo omita no lo ve.
 */

const COOKIE = 'vorea_session';

const REFRESH_VIGENTE = 'refresh-que-trae-el-navegador';
const REFRESH_ROTADO = 'refresh-nuevo-tras-la-rotacion';

const buildTokens = (refreshToken: string): AuthTokens => ({
    accessToken: 'access-firmado',
    accessExpiresAt: new Date(Date.now() + 900_000),
    refreshToken,
    refreshExpiresAt: new Date(Date.now() + 604_800_000),
});


/** El `Set-Cookie` del refresh, o null si la respuesta no trae ninguno. */
const setCookieOf = (res: request.Response): string | null => {
    const raw: unknown = res.headers['set-cookie'];
    const all = Array.isArray(raw) ? (raw as string[]) : typeof raw === 'string' ? [raw] : [];

    return all.find((cookie) => cookie.startsWith(`${COOKIE}=`)) ?? null;
};

/** Un `Set-Cookie` borra si viene sin valor y con la fecha en el pasado. */
const isDeletion = (header: string | null): boolean =>
    header !== null
    && header.startsWith(`${COOKIE}=;`)
    && header.includes('Expires=Thu, 01 Jan 1970');


describe('AuthController (cookie httpOnly)', () => {
    let app: INestApplication;

    const loginExecute = jest.fn();
    const refreshExecute = jest.fn();
    const logoutExecute = jest.fn();

    beforeAll(async () => {
        // La cookie se marca `secure` fuera de desarrollo, y con `secure` el
        // cliente de pruebas no la vería sobre http plano.
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
                RefreshTokenCookie,
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
        it('deja el refresh en una cookie httpOnly acotada a /auth', async () => {
            const res = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ username: 'ana', password: 'secreta', tenantSlug: 'komi' });

            const cookie = setCookieOf(res);

            expect(cookie).toContain(`${COOKIE}=${REFRESH_VIGENTE}`);
            expect(cookie).toContain('HttpOnly');
            expect(cookie).toContain('Path=/auth');
        });


        // El motivo entero del cambio: si el refresh sigue en el JSON, cualquier
        // script de la página lo lee y la cookie no protege de nada.
        it('no devuelve el refresh en el cuerpo', async () => {
            const res = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ username: 'ana', password: 'secreta', tenantSlug: 'komi' });

            expect(JSON.stringify(res.body)).not.toContain(REFRESH_VIGENTE);
            expect(res.body).not.toHaveProperty('refreshToken');
        });
    });


    describe('POST /auth/refresh', () => {
        // Sin cuerpo ninguno: así llega la petición de un cliente que ya solo usa
        // la cookie, y es el caso que respondía 400.
        it('renueva con la cookie y sin cuerpo', async () => {
            const res = await request(app.getHttpServer())
                .post('/auth/refresh')
                .set('Cookie', `${COOKIE}=${REFRESH_VIGENTE}`);

            expect(res.status).toBe(201);
            expect(refreshExecute).toHaveBeenCalledWith(REFRESH_VIGENTE, expect.any(Object));
        });


        it('reemplaza la cookie por el refresh rotado', async () => {
            const res = await request(app.getHttpServer())
                .post('/auth/refresh')
                .set('Cookie', `${COOKIE}=${REFRESH_VIGENTE}`);

            expect(setCookieOf(res)).toContain(`${COOKIE}=${REFRESH_ROTADO}`);
            expect(JSON.stringify(res.body)).not.toContain(REFRESH_ROTADO);
        });


        // Se mantiene mientras haya clientes sin migrar. El día que se retire, este
        // test es el que avisa de que se está retirando.
        it('todavía acepta el refresh por el cuerpo', async () => {
            await request(app.getHttpServer())
                .post('/auth/refresh')
                .send({ refreshToken: REFRESH_VIGENTE });

            expect(refreshExecute).toHaveBeenCalledWith(REFRESH_VIGENTE, expect.any(Object));
        });


        it('la cookie manda sobre el cuerpo cuando llegan los dos', async () => {
            await request(app.getHttpServer())
                .post('/auth/refresh')
                .set('Cookie', `${COOKIE}=${REFRESH_VIGENTE}`)
                .send({ refreshToken: 'refresh-viejo-del-body' });

            expect(refreshExecute).toHaveBeenCalledWith(REFRESH_VIGENTE, expect.any(Object));
        });


        describe('cuando el refresh ya no sirve', () => {
            // Sin esto el navegador guarda una cookie muerta y la reintenta en cada
            // arranque, contra un token que no va a servir nunca más.
            it.each([
                ['inválido', new InvalidRefreshTokenException()],
                ['expirado', new ExpiredRefreshTokenException()],
            ])('borra la cookie si el token está %s', async (_caso, error) => {
                refreshExecute.mockRejectedValue(error);

                const res = await request(app.getHttpServer())
                    .post('/auth/refresh')
                    .set('Cookie', `${COOKIE}=${REFRESH_VIGENTE}`);

                expect(isDeletion(setCookieOf(res))).toBe(true);
            });


            /**
             * La contracara, y el motivo de que no se borre siempre: si lo que falló
             * fue la base, el token puede seguir siendo válido. Borrarlo ahí saca al
             * usuario de su sesión por una caída pasajera que no es culpa suya.
             */
            it('NO borra la cookie si lo que falla es la infraestructura', async () => {
                refreshExecute.mockRejectedValue(new Error('la base no responde'));

                const res = await request(app.getHttpServer())
                    .post('/auth/refresh')
                    .set('Cookie', `${COOKIE}=${REFRESH_VIGENTE}`);

                expect(setCookieOf(res)).toBeNull();
            });
        });


        it('sin cookie ni cuerpo, el caso de uso recibe null y decide', async () => {
            refreshExecute.mockRejectedValue(new InvalidRefreshTokenException());

            await request(app.getHttpServer()).post('/auth/refresh');

            expect(refreshExecute).toHaveBeenCalledWith(null, expect.any(Object));
        });
    });


    describe('POST /auth/logout', () => {
        it('revoca con el token de la cookie y la borra', async () => {
            const res = await request(app.getHttpServer())
                .post('/auth/logout')
                .set('Cookie', `${COOKIE}=${REFRESH_VIGENTE}`);

            expect(logoutExecute).toHaveBeenCalledWith(REFRESH_VIGENTE);
            expect(isDeletion(setCookieOf(res))).toBe(true);
        });


        /**
         * Cerrar sesión sin sesión no es un error: el resultado que se pedía ya
         * está. Un 4xx aquí le deja al front una pantalla de fallo sobre algo que
         * no puede arreglar, y encima con el usuario ya fuera.
         */
        it('sale bien sin cookie ni cuerpo, y borra igual', async () => {
            const res = await request(app.getHttpServer()).post('/auth/logout');

            expect(res.status).toBe(201);
            expect(logoutExecute).toHaveBeenCalledWith(null);
            expect(isDeletion(setCookieOf(res))).toBe(true);
        });


        // La cookie se borra ANTES de tocar la base: si la revocación revienta, el
        // navegador ya se quedó sin el token de todos modos.
        it('borra la cookie aunque la revocación falle', async () => {
            logoutExecute.mockRejectedValue(new Error('la base no responde'));

            const res = await request(app.getHttpServer())
                .post('/auth/logout')
                .set('Cookie', `${COOKIE}=${REFRESH_VIGENTE}`);

            expect(res.status).toBe(500);
            expect(isDeletion(setCookieOf(res))).toBe(true);
        });
    });
});
