import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ProductBranchConfigRepository } from "./domain/product-branch-config.repository";
import { ProductBranchConfigEntity } from "./infrastructure/persistence/models/product-branch-config.entity";
import { ProductBranchConfigRepositoryImpl } from "./infrastructure/persistence/repositories/product-branch-config.repository.impl";
import { ProductCheckerAdapter } from "./infrastructure/persistence/adapters/product-checker.adapter";
import { BranchCheckerAdapter } from "./infrastructure/persistence/adapters/branch-checker.adapter";
import {
    BranchChecker,
    ConfigureProductBranchUseCase,
    ProductChecker,
    RemoveProductBranchConfigUseCase,
    SearchProductBranchConfigsUseCase,
} from "./application";
import { ProductsModule } from "../products/products.module";
import { BranchModule } from "../branch/branch.module";
// Sucursal: las rutas de configuración por sucursal quedan desconectadas en
// esta versión. El módulo sigue existiendo porque el seed usa su repositorio.
// import { ProductBranchConfigController } from "./infrastructure/http/product-branch-config.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ProductBranchConfigEntity,
        ]),
        ProductsModule,
        BranchModule,
    ],

    controllers: [
        // ProductBranchConfigController,
    ],

    providers: [
        {
            provide: ProductBranchConfigRepository,
            useClass: ProductBranchConfigRepositoryImpl,
        },
        {
            provide: ProductChecker,
            useClass: ProductCheckerAdapter,
        },
        {
            provide: BranchChecker,
            useClass: BranchCheckerAdapter,
        },

        {
            provide: ConfigureProductBranchUseCase,
            useFactory: (
                repository: ProductBranchConfigRepository,
                productChecker: ProductChecker,
                branchChecker: BranchChecker,
            ) => new ConfigureProductBranchUseCase(repository, productChecker, branchChecker),
            inject: [ProductBranchConfigRepository, ProductChecker, BranchChecker],
        },
        {
            provide: SearchProductBranchConfigsUseCase,
            useFactory: (
                repository: ProductBranchConfigRepository,
                productChecker: ProductChecker,
            ) => new SearchProductBranchConfigsUseCase(repository, productChecker),
            inject: [ProductBranchConfigRepository, ProductChecker],
        },
        {
            provide: RemoveProductBranchConfigUseCase,
            useFactory: (
                repository: ProductBranchConfigRepository,
            ) => new RemoveProductBranchConfigUseCase(repository),
            inject: [ProductBranchConfigRepository],
        },
    ],

    exports: [
        ProductBranchConfigRepository,
    ],
})
export class ProductBranchConfigModule { }
