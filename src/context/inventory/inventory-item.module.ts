import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { InventoryItemRepository } from "./domain/inventory-item.repository";
import { TenantModule } from "../tenants/tenant.module";
import { BranchModule } from "../branch/branch.module";
import { BranchChecker, ConsumeStockUseCase, CreateInventoryItemUseCase, FindInventoryItemUseCase, InventoryBatchReadRepository, ReceiveStockUseCase, SearchInventoryItemsUseCase, SearchItemBatchesUseCase, SetMinimumStockUseCase, TenantChecker, UpdateInventoryItemUseCase } from "./application";
import { BranchCheckerAdapter, InventoryBatchEntity, InventoryItemController, InventoryItemEntity, InventoryStockEntity, TenantCheckerAdapter, TypeOrmInventoryBatchReadRepository, TypeOrmInventoryItemRepository } from "./infrastructure";


@Module({
    imports: [
        TypeOrmModule.forFeature([InventoryItemEntity, InventoryBatchEntity, InventoryStockEntity]),
        TenantModule,
        BranchModule
    ],
    controllers: [InventoryItemController],
    providers: [
        { provide: InventoryItemRepository, useClass: TypeOrmInventoryItemRepository },
        { provide: InventoryBatchReadRepository, useClass: TypeOrmInventoryBatchReadRepository },
        { provide: TenantChecker, useClass: TenantCheckerAdapter },
        { provide: BranchChecker, useClass: BranchCheckerAdapter },
        {
            provide: CreateInventoryItemUseCase,
            useFactory: (r: InventoryItemRepository, t: TenantChecker) => new CreateInventoryItemUseCase(r, t),
            inject: [InventoryItemRepository, TenantChecker]
        },
        {
            provide: SearchInventoryItemsUseCase,
            useFactory: (r: InventoryItemRepository) => new SearchInventoryItemsUseCase(r), inject: [InventoryItemRepository]
        },
        {
            provide: FindInventoryItemUseCase,
            useFactory: (r: InventoryItemRepository) => new FindInventoryItemUseCase(r),
            inject: [InventoryItemRepository]
        },
        {
            provide: ReceiveStockUseCase,
            useFactory: (repository: InventoryItemRepository, branchChecker: BranchChecker,) => new ReceiveStockUseCase(repository, branchChecker),
            inject: [InventoryItemRepository, BranchChecker]
        },
        {
            provide: ConsumeStockUseCase,
            useFactory: (r: InventoryItemRepository) => new ConsumeStockUseCase(r),
            inject: [InventoryItemRepository]
        },
        {
            provide: SearchItemBatchesUseCase,
            useFactory: (r: InventoryBatchReadRepository) => new SearchItemBatchesUseCase(r),
            inject: [InventoryBatchReadRepository]
        },
        {
            provide: UpdateInventoryItemUseCase,
            useFactory: (r: InventoryItemRepository) => new UpdateInventoryItemUseCase(r),
            inject: [InventoryItemRepository]
        },
        {
            provide: SetMinimumStockUseCase,
            useFactory: (r: InventoryItemRepository, b: BranchChecker) => new SetMinimumStockUseCase(r, b),
            inject: [InventoryItemRepository, BranchChecker],
        },
    ],
})

export class InventoryModule { };