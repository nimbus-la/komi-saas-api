import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductController } from './infrastructure/http/product.controller';
import { ProductEntity } from './infrastructure/persistence/models/product.entity';
import { ProductRepositoryImpl, ProductService } from './infrastructure/persistence/repositories/product.repository.impl';
import { ProductRepository } from './domain';
import { ProductCategoryEntity } from '../product-categories/infrastructure/persistence/models/product-category.entity';
import { CategoriesModule } from "../product-categories/categories.module";
import { UpdateProductUseCase } from './application/use-cases/update-item/update-product.use-case';
import { SearchProductsUseCase } from './application/use-cases/search-items/search-product.use-case';
import { CreateProductUseCase } from './application';
import { TenantModule } from '../tenants/tenant.module';
import { TenantChecker } from './application/ports/tenant-checker';
import { TenantCheckerAdapter } from '../inventory';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      ProductCategoryEntity,
    ]),
    CategoriesModule,
    TenantModule,
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
      provide: TenantChecker,
      useClass: TenantCheckerAdapter,
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
    {
      provide: CreateProductUseCase,
      useFactory: (
        repository: ProductRepository,
        tenantChecker: TenantChecker,
      ) =>
        new CreateProductUseCase(
          repository,
          tenantChecker,
        ),
      inject: [
        ProductRepository,
        TenantChecker,
      ],
    },

  ],
})
export class ProductsModule { }