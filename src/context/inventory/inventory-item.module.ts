import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { InventoryItemEntity } from "./infrastructure/persistence/entities/inventory-item.entity";
import { InventoryBatchEntity } from "./infrastructure/persistence/entities/inventory-batch.entity";
import { InventoryItemController } from "./infrastructure/http/inventory-item.controller";
import { InventoryItemRepository } from "./domain/inventory-item.repository";
import { TypeOrmInventoryItemRepository } from "./infrastructure/persistence/repositories/typeorm-inventory-item.repository";
import { InventoryBatchReadRepository } from "./application/ports/inventory-batch-read.repository";
import { TypeOrmInventoryBatchReadRepository } from "./infrastructure/persistence/repositories/typeorm-inventory-batch-read.repository";
import { CreateInventoryItemUseCase } from "./application/create-item/create-inventory-item.use-case";
import { SearchInventoryItemsUseCase } from "./application/search-items/search-inventory-items.use-case";
import { FindInventoryItemUseCase } from "./application/find-item/find-inventory-item.use-case";
import { ReceiveStockUseCase } from "./application/receive-stock/receive-stock.use-case";
import { ConsumeStockUseCase } from "./application/consume-stock/consume-stock.use-case";
import { SearchItemBatchesUseCase } from "./application/search-item-batches/search-item-batches.use-case";
import { UpdateInventoryItemUseCase } from "./application/update-item/update-inventory-item.use-case";
import { TenantChecker } from "./application/ports/tenant-checker";
import { TenantCheckerAdapter } from "./infrastructure/persistence/adapter/tenant-checker.adapter";
import { TenantModule } from "../tenants/tenant.module";


@Module({
    imports: [
        TypeOrmModule.forFeature([InventoryItemEntity, InventoryBatchEntity]),
        TenantModule,
    ],
    controllers: [InventoryItemController],
    providers: [
        { provide: InventoryItemRepository, useClass: TypeOrmInventoryItemRepository },
        { provide: InventoryBatchReadRepository, useClass: TypeOrmInventoryBatchReadRepository },
        { provide: TenantChecker, useClass: TenantCheckerAdapter },
        {
            provide: CreateInventoryItemUseCase,
            useFactory: (r: InventoryItemRepository, t: TenantChecker) => new CreateInventoryItemUseCase(r, t),
            inject: [InventoryItemRepository, TenantChecker]
        },
        { provide: SearchInventoryItemsUseCase, useFactory: (r: InventoryItemRepository) => new SearchInventoryItemsUseCase(r), inject: [InventoryItemRepository] },
        { provide: FindInventoryItemUseCase, useFactory: (r: InventoryItemRepository) => new FindInventoryItemUseCase(r), inject: [InventoryItemRepository] },
        { provide: ReceiveStockUseCase, useFactory: (r: InventoryItemRepository) => new ReceiveStockUseCase(r), inject: [InventoryItemRepository] },
        { provide: ConsumeStockUseCase, useFactory: (r: InventoryItemRepository) => new ConsumeStockUseCase(r), inject: [InventoryItemRepository] },
        { provide: SearchItemBatchesUseCase, useFactory: (r: InventoryBatchReadRepository) => new SearchItemBatchesUseCase(r), inject: [InventoryBatchReadRepository] },
        {
            provide: UpdateInventoryItemUseCase,
            useFactory: (r: InventoryItemRepository) => new UpdateInventoryItemUseCase(r),
            inject: [InventoryItemRepository]
        },
    ],
})

export class InventoryModule { };