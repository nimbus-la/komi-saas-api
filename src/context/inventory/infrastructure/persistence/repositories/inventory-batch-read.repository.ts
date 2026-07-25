import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";

import { Repository } from "typeorm";

import { Paginated, Pagination } from "@/interfaces";
import { InventoryBatchReadRepository, InventoryBatchView } from "../../../application";
import { InventoryBatchEntity } from "../models/inventory-batch.entity";
import { InventoryItemEntity } from "../models/inventory-item.entity";

@Injectable()
export class TypeOrmInventoryBatchReadRepository implements InventoryBatchReadRepository {
    constructor(
        @InjectRepository(InventoryBatchEntity)
        private readonly batches: Repository<InventoryBatchEntity>,
    ) { };

    /**
     * La tabla de lotes no tiene tenantId propio; se acota al tenant uniendo
     * contra inventory_items (el lote hereda el tenant de su item dueño). Si el
     * item no pertenece al tenant, el join no aporta filas y la lista sale vacía.
     */
    public async findByItem(itemId: string, tenantId: string, pagination: Pagination, branchId?: string): Promise<Paginated<InventoryBatchView>> {
        const query = this.batches.createQueryBuilder('b')
            .innerJoin(InventoryItemEntity, 'item', 'item.id = b.inventoryItemId AND item.tenantId = :tenantId', { tenantId })
            .where('b.inventoryItemId = :itemId', { itemId })
            .orderBy('b.receivedAt', 'DESC')
            .skip((pagination.pageNumber - 1) * pagination.pageSize)
            .take(pagination.pageSize);

        if (branchId !== undefined) {
            query.andWhere('b.branchId = :branchId', { branchId });
        };

        const [rows, total] = await query.getManyAndCount();

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