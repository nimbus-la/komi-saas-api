import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ProductCategoryEntity } from "./infrastructure/persistence/models/product-category.entity";
import { ProductCategoryRepositoryImpl } from "./infrastructure/persistence/repository/product-category.repository.impl";
import { TenantCheckerAdapter } from "./infrastructure/persistence/adapters/tenant-checker.adapter";
import { CategoryController } from "./infrastructure/http/category.controller";
import { ProductCategoryRepository } from "./domain";
import { TenantChecker } from "./application/ports/tenant-checker";
import {
    CreateCategoryUseCase,
    SearchCategoriesUseCase,
    UpdateCategoryUseCase,
} from "./application";
import { TenantModule } from "../tenants/tenant.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ProductCategoryEntity,
        ]),
        TenantModule,
    ],

    controllers: [
        CategoryController,
    ],

    providers: [
        TenantCheckerAdapter,

        {
            provide: ProductCategoryRepository,
            useClass: ProductCategoryRepositoryImpl,
        },
        {
            provide: TenantChecker,
            useExisting: TenantCheckerAdapter,
        },

        {
            provide: CreateCategoryUseCase,
            useFactory: (
                repository: ProductCategoryRepository,
                tenantChecker: TenantChecker,
            ) => new CreateCategoryUseCase(repository, tenantChecker),
            inject: [ProductCategoryRepository, TenantChecker],
        },
        {
            provide: UpdateCategoryUseCase,
            useFactory: (
                repository: ProductCategoryRepository,
                tenantChecker: TenantChecker,
            ) => new UpdateCategoryUseCase(repository, tenantChecker),
            inject: [ProductCategoryRepository, TenantChecker],
        },
        {
            provide: SearchCategoriesUseCase,
            useFactory: (
                repository: ProductCategoryRepository,
                tenantChecker: TenantChecker,
            ) => new SearchCategoriesUseCase(repository, tenantChecker),
            inject: [ProductCategoryRepository, TenantChecker],
        },
    ],

    exports: [
        TypeOrmModule,
        ProductCategoryRepository,
    ],
})
export class CategoriesModule { }
