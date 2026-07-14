import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductController } from './infrastructure/http/product.controller';
import { ProductEntity } from './infrastructure/persistence/models/product.entity';
import { ProductRepositoryImpl, ProductService } from './infrastructure/persistence/repositories/product.repository.impl';
import { ProductRepository } from './domain';
import { ProductCategoryEntity } from '../product-categories/domain/product-category.entity';
import { CategoriesModule } from "../product-categories/categories.module";
import { UpdateProductUseCase } from './application/use-cases/update-item/update-product.use-case';
import { SearchProductsUseCase } from './application/use-cases/search-items/search-product.use-case';
import { CreateProductUseCase } from './application';

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