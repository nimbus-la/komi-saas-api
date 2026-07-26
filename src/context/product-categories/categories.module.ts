import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ProductCategoryEntity } from "./infrastructure/persistence/models/product-category.entity";
import { CategoryController } from "./infrastructure/http/category.controller";
import { ProductCategoryRepository } from "./domain/product-category.repository";
import { CreateCategoryUseCase } from "./application/use-cases/create-category/create-category.use-case";
import { UpdateCategoryUseCase } from "./application/use-cases/update-category/update-category.use-case";
import { SearchCategoriesUseCase } from "./application/use-cases/search-categories/search-categories.use-case";
import { ProductCategoryRepositoryImpl } from "./infrastructure";
import { CategoryService } from "./infrastructure/persistence/services/category.service";
import { TenantChecker } from "./application/ports/tenant-checker";
import { TenantCheckerAdapter } from "./infrastructure/persistence/adapters/tenant-checker.adapter";
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
        CategoryService,
        UpdateCategoryUseCase,

        {
            provide: ProductCategoryRepository,
            useClass: ProductCategoryRepositoryImpl,
        },
        TenantCheckerAdapter,

        {
            provide: TenantChecker,
            useExisting: TenantCheckerAdapter,
        },
        {
            provide: CreateCategoryUseCase,
            useFactory: (
                repository: ProductCategoryRepository,
                tenantChecker: TenantChecker,
            ) =>
                new CreateCategoryUseCase(
                    repository,
                    tenantChecker),
            inject: [ProductCategoryRepository, TenantChecker],
        },
        {
            provide: UpdateCategoryUseCase,
            useFactory: (repository: ProductCategoryRepository) =>
                new UpdateCategoryUseCase(repository),
            inject: [ProductCategoryRepository],
        },
        {
            provide: SearchCategoriesUseCase,
            useFactory: (repository: ProductCategoryRepository) =>
                new SearchCategoriesUseCase(repository),
            inject: [ProductCategoryRepository],
        },

    ],
    exports: [
        TypeOrmModule,
        TenantChecker,
        ProductCategoryRepository,

    ],
})
export class CategoriesModule { }