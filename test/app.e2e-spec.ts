/**
 * `@nestjs/jwt` solo publica ESM y ts-jest no transpila node_modules. Aquí se
 * carga AppModule completo, así que el doble también tiene que traer JwtModule:
 * AuthModule lo registra con registerAsync. Sin token, el guard nunca llega a
 * usar el JwtService, así que puede ir vacío.
 */
jest.mock('@nestjs/jwt', () => {
    class JwtService { }
    class JwtModule { }

    return {
        JwtService,
        JwtModule: Object.assign(JwtModule, {
            registerAsync: () => ({
                module: JwtModule,
                providers: [{ provide: JwtService, useValue: new JwtService() }],
                exports: [JwtService],
            }),
        }),
        TokenExpiredError: class extends Error { },
    };
});

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '@/app.module';


/**
 * Arranque completo de la aplicación.
 *
 * Levanta AppModule tal cual, con su configuración y su conexión a la base del
 * .env, así que necesita Postgres arriba (`docker compose up -d`). Sirve para
 * detectar lo que tsc y las pruebas unitarias no ven: un proveedor que no se
 * puede resolver, un módulo mal importado o una variable de entorno inválida.
 * No escribe nada en la base.
 */

describe('Aplicación (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('resuelve todas las dependencias y arranca', () => {
        expect(app).toBeDefined();
    });

    it('protege las rutas con el guard global de JWT', async () => {
        const { status, body } = await request(app.getHttpServer()).get('/branch');

        expect(status).toBe(401);
        expect(body).toMatchObject({ status: 'ERROR', code: '1001' });
    });
});
