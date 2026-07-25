import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { InventoryItemRepository } from "./domain/inventory-item.repository";
import { TenantModule } from "../tenants/tenant.module";
import { BranchModule } from "../branch/branch.module";
import { BranchChecker, ConsumeStockUseCase, CreateInventoryItemUseCase, FindInventoryItemUseCase, InventoryBatchReadRepository, ReceiveStockUseCase, SearchInventoryItemsUseCase, SearchItemBatchesUseCase, SetGlobalMinimumStockUseCase, SetBranchMinimumStockUseCase, TenantChecker, UpdateInventoryItemUseCase } from "./application";
import { BranchCheckerAdapter, InventoryBatchEntity, InventoryItemController, InventoryItemEntity, InventoryBranchConfigEntity, TenantCheckerAdapter, TypeOrmInventoryBatchReadRepository, TypeOrmInventoryItemRepository } from "./infrastructure";
import { EventPublisher } from "@/shared";
import { EventEmitterPublisher } from "@/infrastructure";
import { RegisterWasteUseCase } from "./application/use-cases/register-waste/register-waste.use-case";
import { CountStockUseCase } from "./application/use-cases/count-stock/count-stock.use-case";


@Module({
    imports: [
        TypeOrmModule.forFeature([InventoryItemEntity, InventoryBatchEntity, InventoryBranchConfigEntity]),
        TenantModule,
        BranchModule
    ],
    controllers: [InventoryItemController],
    providers: [
        { provide: EventPublisher, useClass: EventEmitterPublisher },
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
            useFactory: (
                repository: InventoryItemRepository, 
                branchChecker: BranchChecker, 
                eventPublisher: EventPublisher
            ) => new ReceiveStockUseCase(repository, branchChecker, eventPublisher),
            inject: [InventoryItemRepository, BranchChecker, EventPublisher]
        },
        {
            provide: ConsumeStockUseCase,
            useFactory: (repository: InventoryItemRepository, eventPublisher: EventPublisher) => new ConsumeStockUseCase(repository, eventPublisher),
            inject: [InventoryItemRepository, EventPublisher]
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
            provide: SetGlobalMinimumStockUseCase,
            useFactory: (r: InventoryItemRepository) => new SetGlobalMinimumStockUseCase(r),
            inject: [InventoryItemRepository],
        },
        {
            provide: SetBranchMinimumStockUseCase,
            useFactory: (r: InventoryItemRepository, b: BranchChecker) => new SetBranchMinimumStockUseCase(r, b),
            inject: [InventoryItemRepository, BranchChecker],
        },
        {
            provide: RegisterWasteUseCase,
            useFactory: (r: InventoryItemRepository, e: EventPublisher) => new RegisterWasteUseCase(r, e),
            inject: [InventoryItemRepository, EventPublisher],
        },
        {
            provide: CountStockUseCase,
            useFactory: (r: InventoryItemRepository, e: EventPublisher) => new CountStockUseCase(r, e),
            inject: [InventoryItemRepository, EventPublisher],
        },
    ],
    exports: [
    InventoryItemRepository,
  ],
})

export class InventoryModule { };