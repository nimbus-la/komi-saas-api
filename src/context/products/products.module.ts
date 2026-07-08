import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductController } from './items/infrastructure/http/product.controller';
import { ProductService } from './items/infrastructure/persistence/product.services';
import { ProductEntity } from './items/infrastructure/persistence/product.entity';
import { ProductRepositoryImpl } from './items/infrastructure/persistence/product.repository.impl';
import { CreateProductUseCase } from './items/application/create-item/create-product.use-case';
import { ProductRepository } from './items/domain';
import { UpdateProductUseCase } from "./items/application/update-item/update-product.use-case";
import { SearchProductsUseCase } from "./items/application/search-items/search-product.use-case";
import { ProductCategoryEntity } from './categories/domain/product-category.entity';
import { CategoriesModule } from "./categories/categories.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      ProductCategoryEntity,
    ]),
    CategoriesModule,
  ],
  controllers: [
    ProductController,
  ],
  providers: [
    ProductService,

    {
      provide: ProductRepository,
      useClass: ProductRepositoryImpl,
    },

    {
      provide: CreateProductUseCase,
      useFactory: (repository: ProductRepository) =>
        new CreateProductUseCase(repository),
      inject: [ProductRepository],
    },
    {
      provide: UpdateProductUseCase,
      useFactory: (repository: ProductRepository) =>
        new UpdateProductUseCase(repository),
      inject: [ProductRepository],
    },
    {
      provide: SearchProductsUseCase,
      useFactory: (repository: ProductRepository) =>
        new SearchProductsUseCase(repository),
      inject: [ProductRepository],
    },
  ],
})
export class ProductsModule { }