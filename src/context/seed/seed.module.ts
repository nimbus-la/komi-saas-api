import { Module } from "@nestjs/common";

import { EventPublisher } from "@/shared";
import { EventEmitterPublisher } from "@/infrastructure";

import { TenantModule } from "../tenants/tenant.module";
import { TenantRepository } from "../tenants/domain";
import { BranchModule } from "../branch/branch.module";
import { BranchRepository } from "../branch/domain";
import { RolModule } from "../rol/rol.module";
import { RolRepository } from "../rol/domain/rol.repository";
import { UserModule } from "../user/user.module";
import { UserRepository } from "../user/domain";
import { PasswordHasher } from "../user/application/ports/password-hasher";
import { InventoryModule } from "../inventory/inventory-item.module";
import { InventoryItemRepository } from "../inventory/domain";
import { CategoriesModule } from "../product-categories/categories.module";
import { ProductCategoryRepository } from "../product-categories/domain";
import { ProductsModule } from "../products/products.module";
import { ProductRepository } from "../products/domain";

import { SeedDataCleaner } from "./application/ports/seed-data-cleaner";
import { RunSeedUseCase } from "./application/use-cases/run-seed/run-seed.use-case";
import { SeedController } from "./infrastructure/http/seed.controller";
import { TypeOrmSeedDataCleaner } from "./infrastructure/persistence/adapters/typeorm-seed-data-cleaner.adapter";


/**
 * Módulo de datos de prueba. AppModule solo lo carga en desarrollo.
 *
 * No declara entidades propias: usa los repositorios que exportan los demás
 * módulos, así lo sembrado pasa por los mismos mapeadores que el resto de la API.
 */
@Module({
    imports: [
        TenantModule,
        BranchModule,
        RolModule,
        UserModule,
        InventoryModule,
        CategoriesModule,
        ProductsModule,
    ],

    controllers: [SeedController],

    providers: [
        { provide: SeedDataCleaner, useClass: TypeOrmSeedDataCleaner },
        { provide: EventPublisher, useClass: EventEmitterPublisher },
        {
            provide: RunSeedUseCase,
            useFactory: (
                cleaner: SeedDataCleaner,
                tenants: TenantRepository,
                branches: BranchRepository,
                roles: RolRepository,
                users: UserRepository,
                passwordHasher: PasswordHasher,
                inventoryItems: InventoryItemRepository,
                categories: ProductCategoryRepository,
                products: ProductRepository,
                eventPublisher: EventPublisher,
            ) => new RunSeedUseCase(
                cleaner,
                tenants,
                branches,
                roles,
                users,
                passwordHasher,
                inventoryItems,
                categories,
                products,
                eventPublisher,
            ),
            inject: [
                SeedDataCleaner,
                TenantRepository,
                BranchRepository,
                RolRepository,
                UserRepository,
                PasswordHasher,
                InventoryItemRepository,
                ProductCategoryRepository,
                ProductRepository,
                EventPublisher,
            ],
        },
    ],
})
export class SeedModule { }
