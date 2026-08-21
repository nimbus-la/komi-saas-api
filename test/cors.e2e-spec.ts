import { Controller, Get, INestApplication, Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { CorsConfig } from '@/interfaces';
import { buildCorsOptions } from '@/infrastructure/http/cors.factory';


@Controller('ping')
class PingController {
    @Get()
    get(): { ok: boolean } {
        return { ok: true };
    };
};

const WHITELIST_CONFIG: CorsConfig = {
    origins: ['https://app.komi.com'],
    allowAnyOrigin: false,
    credentials: true,
    maxAge: 86400,
    allowLocalhost: false,
};

const createApp = async (cors: CorsConfig): Promise<INestApplication> => {
    const moduleRef = await Test.createTestingModule({
        controllers: [PingController],
    }).compile();

    const app = moduleRef.createNestApplication();
    app.enableCors(buildCorsOptions(cors));

    await app.init();

    return app;
};


/**
 * Estos tests levantan el middleware real de `cors` y miran los headers que
 * viajan por HTTP. Los unitarios validan la decisión; estos validan que la
 * decisión se traduzca en la respuesta que el navegador espera.
 */
describe('CORS (e2e)', () => {
    let app: INestApplication;

    beforeAll(() => {
        Logger.overrideLogger(false);
    });

    afterEach(async () => {
        await app.close();
    });

    describe('whitelist', () => {
        beforeEach(async () => {
            app = await createApp(WHITELIST_CONFIG);
        });

        it('devuelve el origen permitido y habilita credenciales', async () => {
            const response = await request(app.getHttpServer())
                .get('/ping')
                .set('Origin', 'https://app.komi.com')
                .expect(200);

            expect(response.headers['access-control-allow-origin']).toBe('https://app.komi.com');
            expect(response.headers['access-control-allow-credentials']).toBe('true');
        });

        /**
         * Clave: el servidor NO rechaza la petición, responde 200 sin el header.
         * Es el navegador el que corta el acceso a la respuesta.
         */
        it('responde sin el header Allow-Origin a un origen no permitido', async () => {
            const response = await request(app.getHttpServer())
                .get('/ping')
                .set('Origin', 'https://evil.com')
                .expect(200);

            expect(response.headers['access-control-allow-origin']).toBeUndefined();
        });

        it('marca Vary: Origin para no envenenar caches intermedias', async () => {
            const response = await request(app.getHttpServer())
                .get('/ping')
                .set('Origin', 'https://app.komi.com');

            expect(response.headers['vary']).toContain('Origin');
        });

        it('responde el preflight con 204 y el contrato completo', async () => {
            const response = await request(app.getHttpServer())
                .options('/ping')
                .set('Origin', 'https://app.komi.com')
                .set('Access-Control-Request-Method', 'POST')
                .set('Access-Control-Request-Headers', 'authorization,x-tenant-id')
                .expect(204);

            expect(response.headers['access-control-allow-origin']).toBe('https://app.komi.com');
            expect(response.headers['access-control-allow-methods']).toContain('PATCH');
            expect(response.headers['access-control-allow-headers']).toContain('X-Tenant-Id');
            expect(response.headers['access-control-expose-headers']).toContain('X-Total-Count');
            expect(response.headers['access-control-max-age']).toBe('86400');
        });

        it('no autoriza el preflight de un origen no permitido', async () => {
            const response = await request(app.getHttpServer())
                .options('/ping')
                .set('Origin', 'https://evil.com')
                .set('Access-Control-Request-Method', 'POST');

            expect(response.headers['access-control-allow-origin']).toBeUndefined();
        });

        it('atiende peticiones sin Origin (curl, health checks)', async () => {
            await request(app.getHttpServer())
                .get('/ping')
                .expect(200, { ok: true });
        });
    });

    describe('localhost fuera de producción', () => {
        beforeEach(async () => {
            app = await createApp({ ...WHITELIST_CONFIG, allowLocalhost: true });
        });

        it('acepta cualquier puerto de localhost', async () => {
            const response = await request(app.getHttpServer())
                .get('/ping')
                .set('Origin', 'http://localhost:5173')
                .expect(200);

            expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
        });

        it('rechaza un dominio que solo empieza por localhost', async () => {
            const response = await request(app.getHttpServer())
                .get('/ping')
                .set('Origin', 'http://localhost:3000.evil.com')
                .expect(200);

            expect(response.headers['access-control-allow-origin']).toBeUndefined();
        });
    });

    describe("modo '*'", () => {
        beforeEach(async () => {
            app = await createApp({
                ...WHITELIST_CONFIG,
                origins: [],
                allowAnyOrigin: true,
            });
        });

        it('refleja cualquier origen pero sin credenciales', async () => {
            const response = await request(app.getHttpServer())
                .get('/ping')
                .set('Origin', 'https://cualquiera.com')
                .expect(200);

            expect(response.headers['access-control-allow-origin']).toBe('https://cualquiera.com');
            expect(response.headers['access-control-allow-credentials']).toBeUndefined();
        });
    });
});
