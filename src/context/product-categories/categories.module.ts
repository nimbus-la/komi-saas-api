import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { TenantModule } from "../tenants/tenant.module";

import { ProductCategoryRepository } from "./domain";
import { TenantChecker, CreateCategoryUseCase, SearchCategoriesUseCase, UpdateCategoryUseCase, DeleteCategoryUseCase } from "./application";
import { CategoryController, ProductCategoryModel, TenantCheckerAdapter, TypeOrmProductCategoryRepository } from "./infrastructure";


@Module({
    imports: [
        TypeOrmModule.forFeature([ProductCategoryModel]),
        TenantModule,
    ],

    controllers: [
        CategoryController,
    ],

    providers: [
        TenantCheckerAdapter,

        {
            provide: ProductCategoryRepository,
            useClass: TypeOrmProductCategoryRepository,
        },

        {
            provide: TenantChecker,
            useExisting: TenantCheckerAdapter,
        },

        {
            provide: SearchCategoriesUseCase,
            useFactory: (
                repository: ProductCategoryRepository,
                tenantChecker: TenantChecker,
            ) => new SearchCategoriesUseCase(
                repository,
                tenantChecker
            ),
            inject: [ProductCategoryRepository, TenantChecker],
        },

        {
            provide: CreateCategoryUseCase,
            useFactory: (
                repository: ProductCategoryRepository,
                tenantChecker: TenantChecker,
            ) => new CreateCategoryUseCase(
                repository,
                tenantChecker
            ),
            inject: [ProductCategoryRepository, TenantChecker],
        },

        {
            provide: UpdateCategoryUseCase,
            useFactory: (
                repository: ProductCategoryRepository,
                tenantChecker: TenantChecker,
            ) => new UpdateCategoryUseCase(
                repository,
                tenantChecker
            ),
            inject: [ProductCategoryRepository, TenantChecker],
        },

        {
            provide: DeleteCategoryUseCase,
            useFactory: (
                repository: ProductCategoryRepository,
                tenantChecker: TenantChecker,
            ) => new DeleteCategoryUseCase(
                repository,
                tenantChecker
            ),
            inject: [ProductCategoryRepository, TenantChecker],
        },
    ],

    exports: [
        TypeOrmModule,
        ProductCategoryRepository,
    ],
})

export class CategoriesModule { }
