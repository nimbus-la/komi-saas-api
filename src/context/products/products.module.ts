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
import { TenantChecker } from "@/context/products/application/ports/tenant-checker";
import { TenantCheckerAdapter } from "@/context/products/infrastructure/persistence/adapters/tenant-checker.adapter"; import { ProductCategoryChecker } from "./application/ports/product-category-checker";
import { InventoryItemChecker } from "./application/ports/inventory-item-checker";
import { ProductCategoryCheckerAdapter } from "./infrastructure/persistence/adapters/product-category-checker.adapter";
import { InventoryItemCheckerAdapter } from "./infrastructure/persistence/adapters/inventory-item-checker.adapter";
import { ProductCategoryEntity } from "../product-categories";
import { InventoryItemEntity, InventoryModule } from "../inventory";
import { EventPublisher } from "@/shared";
import { EventEmitterPublisher } from "@/infrastructure";

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
    InventoryModule,

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
      useClass: ProductCategoryCheckerAdapter,
    },

    {
      provide: InventoryItemChecker,
      useExisting: InventoryItemCheckerAdapter,
    },
    {
      provide: EventPublisher,
      useClass: EventEmitterPublisher
    },

    TenantCheckerAdapter,
    InventoryItemCheckerAdapter,
    {
      provide: CreateProductUseCase,
      useFactory: (
        repository: ProductRepository,
        tenantChecker: TenantChecker,
        categoryChecker: ProductCategoryChecker,
        inventoryChecker: InventoryItemChecker,
        eventPublisher: EventPublisher,
      ) => {
        return new CreateProductUseCase(
          repository,
          tenantChecker,
          categoryChecker,
          inventoryChecker,
          eventPublisher,

        );
      },

      inject: [
        ProductRepository,
        TenantChecker,
        ProductCategoryChecker,
        InventoryItemChecker,
        EventPublisher,
      ],
    },

    {
      provide: UpdateProductUseCase,
      useFactory: (
        repository: ProductRepository,
        tenantChecker: TenantChecker,
        categoryChecker: ProductCategoryChecker,
        inventoryChecker: InventoryItemChecker,
      ) => {
        return new UpdateProductUseCase(
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
      provide: SearchProductsUseCase,
      useFactory: (
        repository: ProductRepository,
        tenantChecker: TenantChecker

      ) => {
        return new SearchProductsUseCase(
          repository,
          tenantChecker
        );
      },

      inject: [
        ProductRepository,
        TenantChecker,

      ],
    },
  ],
})
export class ProductsModule { }