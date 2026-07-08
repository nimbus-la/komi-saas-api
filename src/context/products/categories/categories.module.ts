import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ProductCategoryEntity } from "./domain/product-category.entity";
import { CategoryController } from "./infrastructure/http/category.controller";
import { CategoryService } from "./infrastructure/persistence/category.service";
import { ProductCategoryRepository } from "./domain/product-category.repository";
import { ProductCategoryRepositoryImpl } from "./infrastructure/persistence/product-category.repository.impl";
import { CreateCategoryUseCase } from "./application/create-category/create-category.use-case";
import { UpdateCategoryUseCase } from "./application/update-category/update-category.use-case";
import { SearchCategoriesUseCase } from "./application/search-categories/search-categories.use-case";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ProductCategoryEntity,
        ]),
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

        {
            provide: CreateCategoryUseCase,
            useFactory: (repository: ProductCategoryRepository) =>
                new CreateCategoryUseCase(repository),
            inject: [ProductCategoryRepository],
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
    ],
})
export class CategoriesModule { }