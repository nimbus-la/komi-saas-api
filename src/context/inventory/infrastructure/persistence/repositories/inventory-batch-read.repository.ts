import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";

import { Repository } from "typeorm";

import { Paginated, Pagination } from "@/interfaces";
import { InventoryBatchReadRepository } from "@/context/inventory/application/ports/inventory-batch-read.repository";
import { InventoryBatchView } from "@/context/inventory/application";
import { InventoryBatchEntity } from "../models/inventory-batch.entity";

@Injectable()
export class TypeOrmInventoryBatchReadRepository implements InventoryBatchReadRepository {
    constructor(
        @InjectRepository(InventoryBatchEntity)
        private readonly batches: Repository<InventoryBatchEntity>,
    ) { };

    public async findByItem(itemId: string, pagination: Pagination, branchId?: string): Promise<Paginated<InventoryBatchView>> {
        const [rows, total] = await this.batches.findAndCount({
            where: { 
                inventoryItemId: itemId,
                ...(branchId && { branchId })
            },
            order: { receivedAt: 'DESC' },
            skip: (pagination.pageNumber - 1) * pagination.pageSize,
            take: pagination.pageSize,
        });

        const now = new Date();

        return {
            data: rows.map((b): InventoryBatchView => ({
                id: b.id,
                quantityReceived: b.quantityReceived,
                quantityRemaining: b.quantityRemaining,
                unitCostAmount: b.unitCostAmount,
                unitCostCurrency: b.unitCostCurrency,
                expirationDate: b.expirationDate ? b.expirationDate.toISOString() : null,
                receivedAt: b.receivedAt,
                isExpired: b.expirationDate ? b.expirationDate.getTime() < now.getTime() : false,
                isDepleted: Number(b.quantityRemaining) === 0,
            })),
            pageNumber: pagination.pageNumber,
            pageSize: pagination.pageSize,
            total,
        };
    };
};