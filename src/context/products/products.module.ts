import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductController } from './products/infrastructure/http/product.controller';
import { ProductService } from './products/infrastructure/persistence/product.services';
import { ProductEntity } from './products/infrastructure/persistence/product.entity';
import { ProductRepositoryImpl } from './products/infrastructure/persistence/product.repository.impl';
import { CreateProductUseCase } from './products/application/application/create-item/create-product.use-case';
import { ProductRepository } from './products/domain';
import { UpdateProductUseCase } from "./products/application/application/update-item/update-product.use-case";
import { SearchProductsUseCase } from "./products/application/application/search-items/search-product.use-case";
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