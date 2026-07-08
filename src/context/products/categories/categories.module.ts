import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ProductCategoryEntity } from "./domain/product-category.entity";
import { CategoryController } from "./infrastructure/http/category.controller";
import { CategoryService } from "./infrastructure/persistence/category.service";
import { ProductCategoryRepository } from "./domain/product-category.repository";
import { ProductCategoryRepositoryImpl } from "./infrastructure/persistence/product-category.repository.impl";
import { CreateCategoryUseCase } from "./application/create-category/create-category.use-case";

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
    ],
    exports: [
        TypeOrmModule,
    ],
})
export class CategoriesModule { }