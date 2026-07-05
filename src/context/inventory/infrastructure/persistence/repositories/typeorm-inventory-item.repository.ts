import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Repository } from "typeorm";

import { InventoryItemRepository } from "../../../domain/inventory-item.repository";
import { InventoryItemEntity } from "../entities/inventory-item.entity";
import { InventoryBatchEntity } from "../entities/inventory-batch.entity";
import { InventoryItem } from "../../../domain/inventory-item.aggregate";
import { InventoryItemId } from "@/context/inventory/domain/value-objects/inventory-item-id.value-object";
import { InventoryItemName } from "@/context/inventory/domain/value-objects/inventory-item-name.value-object";
import { InventoryItemPersistenceMapper } from "../mappers/inventory-item.persistence-mapper";


@Injectable()
export class TypeOrmInventoryItemRepository implements InventoryItemRepository {
    constructor(
        @InjectRepository(InventoryItemEntity)
        private readonly items: Repository<InventoryItemEntity>,

        @InjectRepository(InventoryBatchEntity)
        private readonly batches: Repository<InventoryBatchEntity>,
    ) { };



    public async save(item: InventoryItem): Promise<void> {
        const { item: itemRow, batch: batchRow } = InventoryItemPersistenceMapper.toPersistence(item);

        await this.items.save(itemRow);

        if (batchRow.length > 0) {
            await this.batches.save(batchRow);
        };
    };



    public async findById(id: InventoryItemId): Promise<InventoryItem | null> {
        const row = await this.items.findOne({ where: { id: id.value } });
        if (row === null) return null;

        const batchRows = await this.activeBatchesOf([row.id]);
        return InventoryItemPersistenceMapper.toAggregate(row, batchRows);
    };



    public async search(): Promise<InventoryItem[]> {
        const rows = await this.items.find();
        if (rows.length === 0) return [];

        const batchRows = await this.activeBatchesOf(rows.map((r) => r.id));
        const grouped = this.groupByItem(batchRows);

        return rows.map((row) =>
            InventoryItemPersistenceMapper.toAggregate(row, grouped.get(row.id) ?? []),
        );
    };



    public async existsByName(name: InventoryItemName): Promise<boolean> {
        return (await this.items.count({ where: { name: name.value } })) > 0;
    };



    /** Solo lotes ACTIVOS: con existencias y no vencidos. */
    private async activeBatchesOf(itemIds: string[]): Promise<InventoryBatchEntity[]> {
        return this.batches.createQueryBuilder('b')
            .where('b.inventoryItemId IN (:...itemIds)', { itemIds })
            .andWhere('b.quantityRemaining > 0')
            .andWhere('(b.expirationDate IS NULL OR b.expirationDate > :now)', { now: new Date() })
            .getMany();
    };



    private groupByItem(rows: InventoryBatchEntity[]): Map<string, InventoryBatchEntity[]> {
        const map = new Map<string, InventoryBatchEntity[]>();

        for (const row of rows) {
            const list = map.get(row.inventoryItemId) ?? [];

            list.push(row);
            map.set(row.inventoryItemId, list);
        };

        return map;
    };
};