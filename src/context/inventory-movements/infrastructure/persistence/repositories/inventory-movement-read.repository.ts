import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Repository } from "typeorm";

import { Paginated, Pagination } from "@/interfaces";
import { InventoryMovementReadRepository, InventoryMovementView, MovementSearchFilters } from "../../../application";
import { InventoryMovementModel } from "../models/inventory-movements.model";
import { InventoryMovementPersistenceMapper } from "../mappers/inventory-movement.persistence-mapper";


@Injectable()
export class TypeOrmInventoryMovementReadRespository implements InventoryMovementReadRepository {
    constructor(
        @InjectRepository(InventoryMovementModel)
        private readonly movements: Repository<InventoryMovementModel>,
    ) { };


    public async search(filters: MovementSearchFilters, pagination: Pagination): Promise<Paginated<InventoryMovementView>> {
        const [rows, total] = await this.movements.findAndCount({
            where: {
                tenantId: filters.tenantId,
                ...(filters.inventoryItemId ? { inventoryItemId: filters.inventoryItemId } : {}),
                ...(filters.branchId ? { branchId: filters.branchId } : {}),
                ...(filters.movementType ? { movementType: filters.movementType } : {})
            },
            order: { occurredAt: 'DESC' },
            skip: (pagination.pageNumber - 1) * pagination.pageSize,
            take: pagination.pageSize,
        });

        return {
            rows: InventoryMovementPersistenceMapper.movementResponse(rows),
            pageNumber: pagination.pageNumber,
            pageSize: pagination.pageSize,
            total
        };
    };
};