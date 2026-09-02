/**
 * `@nestjs/jwt` solo publica ESM y ts-jest no transpila node_modules. El
 * controlador lo arrastra por el barrel de auth, aunque aqui no se use.
 */
jest.mock('@nestjs/jwt', () => ({
    JwtService: class { },
    TokenExpiredError: class extends Error { },
}));

import { CanActivate, ExecutionContext, INestApplication, Injectable, ValidationPipe } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { InventoryItemController } from '@/context/inventory/infrastructure/http/inventory-item.controller';
import {
    ConsumeStockUseCase,
    CreateInventoryItemUseCase,
    FindInventoryItemUseCase,
    ReceiveStockUseCase,
    SearchInventoryItemsUseCase,
    SearchItemBatchesUseCase,
    SetBranchMinimumStockUseCase,
    SetGlobalMinimumStockUseCase,
    UpdateInventoryItemUseCase,
} from '@/context/inventory/application';
import { RegisterWasteUseCase } from '@/context/inventory/application/use-cases/register-waste/register-waste.use-case';
import { CountStockUseCase } from '@/context/inventory/application/use-cases/count-stock/count-stock.use-case';
import { TenantScopeGuard } from '@/auth/infrastructure/guards/tenant-scope.guard';
import { RequestWithUser } from '@/auth/infrastructure/types';

const TOKEN_TENANT = '11111111-1111-4111-8111-111111111111';
const OTHER_TENANT = '22222222-2222-4222-8222-222222222222';
const BRANCH = '33333333-3333-4333-8333-333333333333';
const ITEM = '44444444-4444-4444-8444-444444444444';

/** Sustituye al JwtAuthGuard: deja en la peticion el usuario que traeria el token. */
@Injectable()
class FakeJwtGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest<RequestWithUser>();
        req.user = {
            userId: 'usr-1',
            tenantId: TOKEN_TENANT,
            branchId: null,
            rolScope: 'tenant',
            sessionId: 'ses-1',
        };
        return true;
    }
}

const spy = () => jest.fn().mockResolvedValue(undefined);

describe('Inventory item: tenantId desde el JWT', () => {
    let app: INestApplication;
    const useCases = {
        create: spy(),
        search: spy(),
        find: spy(),
        receive: spy(),
        consume: spy(),
        batches: spy(),
        update: spy(),
        global: spy(),
        branches: spy(),
        waste: spy(),
        count: spy(),
    };

    beforeAll(async () => {
        const stub = (execute: jest.Mock) => ({ execute });

        const moduleRef = await Test.createTestingModule({
            controllers: [InventoryItemController],
            providers: [
                { provide: CreateInventoryItemUseCase, useValue: stub(useCases.create) },
                { provide: SearchInventoryItemsUseCase, useValue: stub(useCases.search) },
                { provide: FindInventoryItemUseCase, useValue: stub(useCases.find) },
                { provide: ReceiveStockUseCase, useValue: stub(useCases.receive) },
                { provide: ConsumeStockUseCase, useValue: stub(useCases.consume) },
                { provide: SearchItemBatchesUseCase, useValue: stub(useCases.batches) },
                { provide: UpdateInventoryItemUseCase, useValue: stub(useCases.update) },
                { provide: SetGlobalMinimumStockUseCase, useValue: stub(useCases.global) },
                { provide: SetBranchMinimumStockUseCase, useValue: stub(useCases.branches) },
                { provide: RegisterWasteUseCase, useValue: stub(useCases.waste) },
                { provide: CountStockUseCase, useValue: stub(useCases.count) },
                { provide: APP_GUARD, useClass: FakeJwtGuard },
                { provide: APP_GUARD, useClass: TenantScopeGuard },
                Reflector,
            ],
        }).compile();

        app = moduleRef.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
        await app.init();
    });

    afterAll(async () => { await app.close(); });
    beforeEach(() => { jest.clearAllMocks(); });

    describe('el tenantId que llega al caso de uso sale del token', () => {
        it('POST / (create)', async () => {
            await request(app.getHttpServer())
                .post('/inventory/item')
                .send({ name: 'Harina', unitOfMeasure: 'kg', isPerishable: false })
                .expect(201);

            expect(useCases.create).toHaveBeenCalledWith({
                name: 'Harina', unitOfMeasure: 'kg', isPerishable: false, tenantId: TOKEN_TENANT,
            });
        });

        it('GET / (list)', async () => {
            await request(app.getHttpServer()).get('/inventory/item').expect(200);
            expect(useCases.search).toHaveBeenCalledWith(TOKEN_TENANT, { pageNumber: 1, pageSize: 20 }, undefined);
        });

        it('GET /find', async () => {
            await request(app.getHttpServer())
                .get('/inventory/item/find')
                .query({ itemId: ITEM })
                .expect(200);
            expect(useCases.find).toHaveBeenCalledWith(ITEM, TOKEN_TENANT, undefined);
        });

        it('GET /batches', async () => {
            await request(app.getHttpServer())
                .get('/inventory/item/batches')
                .query({ itemId: ITEM })
                .expect(200);
            expect(useCases.batches).toHaveBeenCalledWith(ITEM, TOKEN_TENANT, { pageNumber: 1, pageSize: 20 }, undefined);
        });

        it('POST /receive', async () => {
            await request(app.getHttpServer())
                .post('/inventory/item/receive')
                .send({ itemId: ITEM, branchId: BRANCH, quantityReceived: '10', totalCostAmount: '1000' })
                .expect(201);
            expect(useCases.receive.mock.calls[0][0]).toMatchObject({ itemId: ITEM, tenantId: TOKEN_TENANT });
        });

        it('POST /consume', async () => {
            await request(app.getHttpServer())
                .post('/inventory/item/consume')
                .send({ itemId: ITEM, branchId: BRANCH, quantity: '2' })
                .expect(201);
            expect(useCases.consume.mock.calls[0][0]).toMatchObject({ itemId: ITEM, tenantId: TOKEN_TENANT });
        });

        it('POST /waste', async () => {
            await request(app.getHttpServer())
                .post('/inventory/item/waste')
                .send({ itemId: ITEM, branchId: BRANCH, quantity: '2', reason: 'Se dano el producto' })
                .expect(201);
            expect(useCases.waste.mock.calls[0][0]).toMatchObject({ itemId: ITEM, tenantId: TOKEN_TENANT });
        });

        it('POST /count', async () => {
            await request(app.getHttpServer())
                .post('/inventory/item/count')
                .send({ itemId: ITEM, branchId: BRANCH, actualTotal: '5', reason: 'Conteo fisico mensual' })
                .expect(201);
            expect(useCases.count.mock.calls[0][0]).toMatchObject({ itemId: ITEM, tenantId: TOKEN_TENANT });
        });

        it('PATCH /update', async () => {
            await request(app.getHttpServer())
                .patch('/inventory/item/update')
                .send({ itemId: ITEM, name: 'Harina integral' })
                .expect(200);
            expect(useCases.update).toHaveBeenCalledWith(ITEM, TOKEN_TENANT, { name: 'Harina integral' });
        });

        it('PATCH /minimum/global', async () => {
            await request(app.getHttpServer())
                .patch('/inventory/item/minimum/global')
                .send({ itemId: ITEM, minStock: '500' })
                .expect(200);
            expect(useCases.global).toHaveBeenCalledWith({ itemId: ITEM, tenantId: TOKEN_TENANT, minStock: '500' });
        });

        it('PATCH /minimum/branches', async () => {
            await request(app.getHttpServer())
                .patch('/inventory/item/minimum/branches')
                .send({ itemId: ITEM, branches: [{ branchId: BRANCH, minStock: '500' }] })
                .expect(200);
            expect(useCases.branches).toHaveBeenCalledWith({
                itemId: ITEM, tenantId: TOKEN_TENANT, branches: [{ branchId: BRANCH, minStock: '500' }],
            });
        });
    });

    describe('el tenantId ya no se acepta por la peticion', () => {
        it('body con el tenantId propio -> 400', async () => {
            const res = await request(app.getHttpServer())
                .post('/inventory/item')
                .send({ tenantId: TOKEN_TENANT, name: 'Harina', unitOfMeasure: 'kg', isPerishable: false });
            expect(res.status).toBe(400);
            expect(useCases.create).not.toHaveBeenCalled();
        });

        it('query con el tenantId propio -> 400', async () => {
            const res = await request(app.getHttpServer()).get('/inventory/item').query({ tenantId: TOKEN_TENANT });
            expect(res.status).toBe(400);
            expect(useCases.search).not.toHaveBeenCalled();
        });

        it('body con el tenantId de otro negocio -> rechazado por el guard', async () => {
            const res = await request(app.getHttpServer())
                .post('/inventory/item')
                .send({ tenantId: OTHER_TENANT, name: 'Harina', unitOfMeasure: 'kg', isPerishable: false });
            expect(res.status).toBeGreaterThanOrEqual(400);
            expect(useCases.create).not.toHaveBeenCalled();
        });

        it('GET /find con tenantId en query -> 400', async () => {
            const res = await request(app.getHttpServer())
                .get('/inventory/item/find')
                .query({ itemId: ITEM, tenantId: TOKEN_TENANT });
            expect(res.status).toBe(400);
            expect(useCases.find).not.toHaveBeenCalled();
        });
    });
    describe('el itemId viaja en el body, no en la ruta', () => {
        it('las rutas viejas con el id ya no existen -> 404', async () => {
            await request(app.getHttpServer())
                .patch(`/inventory/item/minimum/global/${ITEM}`)
                .send({ minStock: '500' })
                .expect(404);

            await request(app.getHttpServer()).get(`/inventory/item/${ITEM}`).expect(404);
            await request(app.getHttpServer()).get(`/inventory/item/batches/${ITEM}`).expect(404);
        });

        it('itemId ausente -> 400', async () => {
            const res = await request(app.getHttpServer())
                .patch('/inventory/item/update')
                .send({ name: 'Harina integral' });
            expect(res.status).toBe(400);
            expect(useCases.update).not.toHaveBeenCalled();
        });

        it('itemId que no es UUID -> 400', async () => {
            const res = await request(app.getHttpServer())
                .post('/inventory/item/consume')
                .send({ itemId: 'itm-1', branchId: BRANCH, quantity: '2' });
            expect(res.status).toBe(400);
            expect(useCases.consume).not.toHaveBeenCalled();
        });

        it('update no le pasa el itemId al caso de uso dentro de los cambios', async () => {
            await request(app.getHttpServer())
                .patch('/inventory/item/update')
                .send({ itemId: ITEM, name: 'Harina integral' })
                .expect(200);
            expect(useCases.update).toHaveBeenCalledWith(ITEM, TOKEN_TENANT, { name: 'Harina integral' });
        });
        it('GET /find sin itemId -> 400', async () => {
            const res = await request(app.getHttpServer()).get('/inventory/item/find');
            expect(res.status).toBe(400);
            expect(useCases.find).not.toHaveBeenCalled();
        });

        it('GET /batches pagina con pageNumber, igual que el listado', async () => {
            await request(app.getHttpServer())
                .get('/inventory/item/batches')
                .query({ itemId: ITEM, pageNumber: 3, pageSize: 50, branchId: BRANCH })
                .expect(200);
            expect(useCases.batches).toHaveBeenCalledWith(ITEM, TOKEN_TENANT, { pageNumber: 3, pageSize: 50 }, BRANCH);
        });
    });
});
