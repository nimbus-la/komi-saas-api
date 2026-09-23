/**
 * `@nestjs/jwt` solo publica ESM y ts-jest no transpila node_modules. El
 * controlador lo arrastra por el barrel de auth, aunque aquí no se use.
 */
jest.mock('@nestjs/jwt', () => ({
    JwtService: class { },
    TokenExpiredError: class extends Error { },
}));

import { CanActivate, ExecutionContext, INestApplication, Injectable, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import request from 'supertest';

import { RequestWithUser } from '@/auth/infrastructure/types';
import { BranchModule } from '@/context/branch/branch.module';
import { BranchAggregate } from '@/context/branch/domain/branch.aggregate';
import { BranchRepository } from '@/context/branch/domain/branch.repository';
import { BranchAddress } from '@/context/branch/domain/value-object/branch-address.value-object';
import { BranchCity } from '@/context/branch/domain/value-object/branch-city.value-object';
import { BranchDepartment } from '@/context/branch/domain/value-object/branch-department.value-object';
import { BranchId } from '@/context/branch/domain/value-object/branch-id.value-object';
import { BranchName } from '@/context/branch/domain/value-object/branch-name.value-object';
import { BranchPhone } from '@/context/branch/domain/value-object/branch-phone.value-object';
import { AllExceptionsFilter } from '@/infrastructure/http/all-exceptions.filter';
import { ResponseInterceptor } from '@/infrastructure/http/response.interceptor';
import { buildLoggerParams } from '@/infrastructure/logging/logger.config';

import { createTemporaryDatabase, TemporaryDatabase } from './support/temporary-database';


/**
 * Sucursales contra Postgres de verdad.
 *
 * Las pruebas unitarias cubren las reglas con dobles; estas cubren lo que solo
 * se ve con la base: que cada consulta filtre por negocio y descarte las
 * eliminadas, la búsqueda de texto con sus comodines, la paginación, el índice
 * único del nombre y las fechas con zona horaria.
 *
 * Corren sobre una base temporal con el esquema real de public/db, que se crea
 * al empezar y se borra al terminar. Necesitan el contenedor de Postgres arriba.
 */

const TENANT_A = '11111111-1111-4111-8111-111111111111';
const TENANT_B = '22222222-2222-4222-8222-222222222222';
const BRANCH_OF_B = '33333333-3333-4333-8333-333333333333';

/** Sustituye al JwtAuthGuard: deja en la petición el usuario que traería el token. */
@Injectable()
class FakeJwtGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest<RequestWithUser>();
        req.user = {
            userId: 'usr-1',
            tenantId: TENANT_A,
            branchId: null,
            rolScope: 'ADMINISTRATIVE',
            sessionId: 'ses-1',
        };
        return true;
    }
}

const BRANCH_BODY = {
    name: 'Centro',
    address: 'Calle 10 # 5-20',
    phone: '3001234567',
    city: 'Cali',
    department: 'Valle',
};

interface BranchRow {
    branch_id: string;
    branch_is_deleted: boolean;
    branch_created_at: Date;
}


describe('Sucursales contra Postgres (e2e)', () => {
    let app: INestApplication;
    let db: TemporaryDatabase;
    let repository: BranchRepository;

    beforeAll(async () => {
        db = await createTemporaryDatabase('komi_e2e_branch');

        await db.query(
            `INSERT INTO tenants (tenant_id, tenant_name, tenant_description, tenant_slug, tenant_nit)
             VALUES ($1, 'Negocio A', 'Pruebas', 'negocio-a', '900000001'),
                    ($2, 'Negocio B', 'Pruebas', 'negocio-b', '900000002')`,
            [TENANT_A, TENANT_B],
        );

        const moduleRef = await Test.createTestingModule({
            imports: [
                LoggerModule.forRoot(
                    buildLoggerParams({ level: 'silent', pretty: false, logRequestPayload: false }),
                ),
                TypeOrmModule.forRoot({
                    type: 'postgres',
                    ...db.connection,
                    database: db.name,
                    autoLoadEntities: true,
                    synchronize: false,
                }),
                BranchModule,
            ],
            providers: [
                { provide: APP_GUARD, useClass: FakeJwtGuard },
                { provide: APP_FILTER, useClass: AllExceptionsFilter },
                { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
            ],
        }).compile();

        app = moduleRef.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
        await app.init();

        repository = app.get(BranchRepository);
    });

    afterAll(async () => {
        await app?.close();
        await db?.drop();
    });

    beforeEach(async () => {
        // DELETE y no TRUNCATE: users e inventario tienen llaves foráneas hacia
        // branches y Postgres no deja truncarla, aunque esas tablas estén vacías.
        await db.query('DELETE FROM branches');
    });


    const http = () => request(app.getHttpServer());

    const create = (body: Partial<typeof BRANCH_BODY> = {}) =>
        http().post('/branch').send({ ...BRANCH_BODY, ...body });

    const list = (query: Record<string, string | number | boolean> = {}) =>
        http().get('/branch').query(query);

    const idOf = async (name: string): Promise<string> => {
        const [row] = await db.query<BranchRow>(
            'SELECT branch_id FROM branches WHERE branch_name = $1 AND branch_is_deleted = false',
            [name],
        );
        return row!.branch_id;
    };

    /** Sucursal del negocio B, escrita directo en la base: el token es siempre del A. */
    const insertBranchOfB = () => db.query(
        `INSERT INTO branches (branch_id, tenant_id, branch_name, branch_address, branch_phone, branch_city, branch_department)
         VALUES ($1, $2, 'Norte', 'Carrera 1 # 1-1', '3009999999', 'Bogotá', 'Cundinamarca')`,
        [BRANCH_OF_B, TENANT_B],
    );


    describe('crear y listar', () => {
        it('crea la sucursal en el negocio del token y la devuelve en el listado', async () => {
            await create().expect(201);

            const { body } = await list().expect(200);

            expect(body.content).toMatchObject({ pageNumber: 1, pageSize: 20, total: 1 });
            expect(body.content.rows[0]).toMatchObject({ ...BRANCH_BODY, tenantId: TENANT_A, isActive: true });
            expect(body.content.rows[0]).not.toHaveProperty('isDeleted');
        });

        it('ordena por nombre y pagina', async () => {
            await create({ name: 'Sur' }).expect(201);
            await create({ name: 'Centro' }).expect(201);
            await create({ name: 'Norte' }).expect(201);

            const { body } = await list({ pageNumber: 2, pageSize: 2 }).expect(200);

            expect(body.content.total).toBe(3);
            expect(body.content.rows.map((row: { name: string }) => row.name)).toEqual(['Sur']);
        });

        it('una página sin resultados sale como INFO', async () => {
            const { body } = await list().expect(200);

            expect(body).toMatchObject({ status: 'INFO', content: null });
        });
    });


    describe('aislamiento por negocio', () => {
        beforeEach(async () => {
            await insertBranchOfB();
        });

        it('no lista sucursales de otro negocio', async () => {
            await create().expect(201);

            const { body } = await list().expect(200);

            expect(body.content.total).toBe(1);
            expect(body.content.rows[0].name).toBe('Centro');
        });

        it('no la encuentra ni filtrando por su id', async () => {
            const { body } = await list({ branchId: BRANCH_OF_B }).expect(200);

            expect(body).toMatchObject({ status: 'INFO', content: null });
        });

        it('no deja actualizarla ni eliminarla: responde 1207', async () => {
            const update = await http().patch('/branch/update').send({ branchId: BRANCH_OF_B, city: 'Cali' });
            const remove = await http().delete('/branch/delete').query({ branchId: BRANCH_OF_B });

            expect([update.status, update.body.code]).toEqual([404, '1207']);
            expect([remove.status, remove.body.code]).toEqual([404, '1207']);

            const [row] = await db.query<{ branch_city: string; branch_is_deleted: boolean }>(
                'SELECT branch_city, branch_is_deleted FROM branches WHERE branch_id = $1',
                [BRANCH_OF_B],
            );
            expect(row).toEqual({ branch_city: 'Bogotá', branch_is_deleted: false });
        });

        it('permite usar un nombre que ya existe en otro negocio', async () => {
            await create({ name: 'Norte' }).expect(201);
        });
    });


    describe('búsqueda de texto', () => {
        beforeEach(async () => {
            await create().expect(201);
            await create({
                name: 'Norte',
                address: 'Carrera 50 # 1-1',
                phone: '6041112233',
                city: 'Medellín',
                department: 'Antioquia',
            }).expect(201);
        });

        it.each([
            ['el nombre', 'centr'],
            ['la dirección', 'calle 10'],
            ['el teléfono', '300123'],
            ['la ciudad', 'CALI'],
            ['el departamento', 'vall'],
        ])('busca en %s sin importar mayúsculas', async (_, text) => {
            const { body } = await list({ text }).expect(200);

            expect(body.content.rows.map((row: { name: string }) => row.name)).toEqual(['Centro']);
        });

        it.each(['%', '_'])('toma "%s" como texto y no como comodín', async (text) => {
            const { body } = await list({ text }).expect(200);

            expect(body).toMatchObject({ status: 'INFO', content: null });
        });
    });


    describe('filtro de estado', () => {
        it('separa activas de inactivas', async () => {
            await create().expect(201);
            await create({ name: 'Norte' }).expect(201);
            await http().patch('/branch/update')
                .send({ branchId: await idOf('Norte'), isActive: false })
                .expect(200);

            const activas = await list({ branchStatus: true }).expect(200);
            const inactivas = await list({ branchStatus: false }).expect(200);

            expect(activas.body.content.rows.map((row: { name: string }) => row.name)).toEqual(['Centro']);
            expect(inactivas.body.content.rows.map((row: { name: string }) => row.name)).toEqual(['Norte']);
        });
    });


    describe('nombre único', () => {
        beforeEach(async () => {
            await create().expect(201);
        });

        it('rechaza el mismo nombre con otras mayúsculas: 1206', async () => {
            const { status, body } = await create({ name: 'CENTRO' });

            expect([status, body.code]).toEqual([409, '1206']);
        });

        it('el índice único lo frena aunque se salte la validación del caso de uso', async () => {
            // Es lo que pasa con dos creaciones al mismo tiempo: las dos pasan
            // existsByName y el índice decide.
            const duplicate = BranchAggregate.create({
                tenantId: TENANT_A,
                name: BranchName.create('centro'),
                address: BranchAddress.create('Calle 99 # 9-99'),
                phone: BranchPhone.create('3000000000'),
                city: BranchCity.create('Cali'),
                department: BranchDepartment.create('Valle'),
            });

            await expect(repository.save(duplicate)).rejects.toMatchObject({ code: '1206' });
        });

        it('permite renombrar cambiando solo mayúsculas', async () => {
            await http().patch('/branch/update')
                .send({ branchId: await idOf('Centro'), name: 'CENTRO' })
                .expect(200);
        });
    });


    describe('borrado lógico', () => {
        let id: string;

        beforeEach(async () => {
            await create().expect(201);
            id = await idOf('Centro');
            await http().delete('/branch/delete').query({ branchId: id }).expect(200);
        });

        it('deja la fila en la base marcada como eliminada', async () => {
            const [row] = await db.query<BranchRow>(
                'SELECT branch_is_deleted FROM branches WHERE branch_id = $1',
                [id],
            );

            expect(row?.branch_is_deleted).toBe(true);
        });

        it('la sucursal desaparece del listado', async () => {
            const { body } = await list().expect(200);

            expect(body).toMatchObject({ status: 'INFO', content: null });
        });

        it('no se puede actualizar ni eliminar otra vez: 1207', async () => {
            const update = await http().patch('/branch/update').send({ branchId: id, city: 'Palmira' });
            const remove = await http().delete('/branch/delete').query({ branchId: id });

            expect([update.status, update.body.code]).toEqual([404, '1207']);
            expect([remove.status, remove.body.code]).toEqual([404, '1207']);
        });

        it('su nombre queda libre para una sucursal nueva', async () => {
            await create().expect(201);
        });
    });


    describe('existsInTenant', () => {
        it('solo es true para una sucursal activa, sin eliminar y del mismo negocio', async () => {
            await insertBranchOfB();
            await create({ name: 'Activa' }).expect(201);
            await create({ name: 'Inactiva' }).expect(201);
            await create({ name: 'Eliminada' }).expect(201);

            const activa = await idOf('Activa');
            const inactiva = await idOf('Inactiva');
            const eliminada = await idOf('Eliminada');

            await http().patch('/branch/update').send({ branchId: inactiva, isActive: false }).expect(200);
            await http().delete('/branch/delete').query({ branchId: eliminada }).expect(200);

            const exists = (id: string) => repository.existsInTenant(BranchId.create(id), TENANT_A);

            await expect(exists(activa)).resolves.toBe(true);
            await expect(exists(inactiva)).resolves.toBe(false);
            await expect(exists(eliminada)).resolves.toBe(false);
            await expect(exists(BRANCH_OF_B)).resolves.toBe(false);
        });
    });


    describe('fechas', () => {
        it('guarda el instante exacto de creación, sin correrlo por la zona horaria', async () => {
            await create().expect(201);

            // La comparación la hace Postgres contra su propio now(). Leer la
            // fecha desde Node no sirve: el driver escribe y lee en la hora local
            // de Node, y la ida y vuelta cuadra aunque la columna guarde mal la hora.
            const [row] = await db.query<{ seconds_ago: number }>(
                'SELECT EXTRACT(EPOCH FROM now() - branch_created_at)::float AS seconds_ago FROM branches',
            );

            expect(row!.seconds_ago).toBeGreaterThanOrEqual(0);
            expect(row!.seconds_ago).toBeLessThan(60);
        });
    });
});
