import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ProductBranchConfigRepository } from "./domain/product-branch-config.repository";
import { ProductBranchConfigEntity } from "./infrastructure/persistence/models/product-branch-config.entity";
import { ProductBranchConfigRepositoryImpl } from "./infrastructure/persistence/repositories/product-branch-config.repository.impl";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ProductBranchConfigEntity,
        ]),
    ],

    providers: [
        {
            provide: ProductBranchConfigRepository,
            useClass: ProductBranchConfigRepositoryImpl,
        },
    ],

    exports: [
        ProductBranchConfigRepository,
    ],
})
export class ProductBranchConfigModule { }
