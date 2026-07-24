import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductController } from "./infrastructure/http/product.controller";
import { ProductEntity } from "./infrastructure/persistence/models/product.entity";
import { RecipeIngredientEntity } from "./infrastructure/persistence/models/recipe-ingredient.entity";
import { ProductRepositoryImpl } from "./infrastructure/persistence/repositories/product.repository.impl";
import { ProductRepository } from "./domain";
import { UpdateProductUseCase } from "./application/use-cases/update-item/update-product.use-case";
import { SearchProductsUseCase } from "./application/use-cases/search-items/search-product.use-case";
import { CreateProductUseCase } from "./application";
import { CategoriesModule } from "../product-categories/categories.module";
import { TenantModule } from "../tenants/tenant.module";
import { TenantChecker } from "./application/ports/tenant-checker";
import { ProductCategoryChecker } from "./application/ports/product-category-checker";
import { InventoryItemChecker } from "./application/ports/inventory-item-checker";
import { TenantCheckerAdapter } from "./infrastructure/persistence/adapters/tenant-checker.adapter";
import { ProductCategoryCheckerAdapter } from "./infrastructure/persistence/adapters/product-category-checker.adapter";
import { InventoryItemCheckerAdapter } from "./infrastructure/persistence/adapters/inventory-item-checker.adapter";
import { ProductCategoryEntity } from "../product-categories";
import { InventoryItemEntity } from "../inventory";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      ProductCategoryEntity,
      RecipeIngredientEntity,
      InventoryItemEntity,
    ]),
    CategoriesModule,
    TenantModule,
  ],

  controllers: [
    ProductController,
  ],

  providers: [
    {
      provide: InventoryItemChecker,
      useExisting: InventoryItemCheckerAdapter,
    },
    {
      provide: ProductRepository,
      useClass: ProductRepositoryImpl,
    },
    {
      provide: TenantChecker,
      useExisting: TenantCheckerAdapter,
    },

    {
      provide: ProductCategoryChecker,
      useExisting: ProductCategoryCheckerAdapter,
    },

    {
      provide: InventoryItemChecker,
      useExisting: InventoryItemCheckerAdapter,
    },
    TenantCheckerAdapter,
    ProductCategoryCheckerAdapter,
    InventoryItemCheckerAdapter,
    {
      provide: CreateProductUseCase,
      useFactory: (
        repository: ProductRepository,
        tenantChecker: TenantChecker,
        categoryChecker: ProductCategoryChecker,
        inventoryChecker: InventoryItemChecker,
      ) => {
        return new CreateProductUseCase(
          repository,
          tenantChecker,
          categoryChecker,
          inventoryChecker,
        );
      },

      inject: [
        ProductRepository,
        TenantChecker,
        ProductCategoryChecker,
        InventoryItemChecker,
      ],
    },

    {
      provide: UpdateProductUseCase,
      useFactory: (
        repository: ProductRepository,
      ) => {
        return new UpdateProductUseCase(
          repository,
        );
      },

      inject: [
        ProductRepository,
      ],
    },

    {
      provide: SearchProductsUseCase,
      useFactory: (
        repository: ProductRepository,
      ) => {
        return new SearchProductsUseCase(
          repository,
        );
      },

      inject: [
        ProductRepository,
      ],
    },
  ],
})
export class ProductsModule { }