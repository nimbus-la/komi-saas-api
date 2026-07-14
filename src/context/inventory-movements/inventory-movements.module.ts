import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { InventoryMovementRepository } from "./domain";
import { InventoryMovementReadRepository, RecordMovementUseCase, SearchMovementsUseCase } from "./application";
import { InventoryMovementController, InventoryMovementModel, StockMovementHandlers, TypeOrmInventoryMovementReadRespository, TypeOrmInventoryMovementRepository } from "./infrastructure";

@Module({
    imports: [TypeOrmModule.forFeature([InventoryMovementModel])],

    controllers: [InventoryMovementController],

    providers: [
        { provide: InventoryMovementRepository, useClass: TypeOrmInventoryMovementRepository },
        { provide: InventoryMovementReadRepository, useClass: TypeOrmInventoryMovementReadRespository },

        {
            provide: RecordMovementUseCase,
            useFactory: (repository: InventoryMovementRepository) => new RecordMovementUseCase(repository),
            inject: [InventoryMovementRepository],
        },
        {
            provide: SearchMovementsUseCase,
            useFactory: (reader: InventoryMovementReadRepository) => new SearchMovementsUseCase(reader),
            inject: [InventoryMovementReadRepository],
        },

        StockMovementHandlers,
    ],
})

export class InventoryMovementModule { };