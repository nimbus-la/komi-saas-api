import { Injectable } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";

import { DataSource, Repository } from "typeorm";

import { InventoryItemRepository, InventoryItem, InventoryItemId, InventoryItemName } from "../../../domain";
import { InventoryItemEntity } from "../models/inventory-item.entity";
import { InventoryBatchEntity } from "../models/inventory-batch.entity";
import { InventoryItemPersistenceMapper } from "../mappers/inventory-item.persistence-mapper";
import { InventoryStockEntity } from "../models/inventory-stock.entity";


@Injectable()
export class TypeOrmInventoryItemRepository implements InventoryItemRepository {
    constructor(
        @InjectRepository(InventoryItemEntity)
        private readonly items: Repository<InventoryItemEntity>,

        @InjectRepository(InventoryBatchEntity)
        private readonly batches: Repository<InventoryBatchEntity>,

        @InjectRepository(InventoryStockEntity)
        private readonly stocks: Repository<InventoryStockEntity>,

        @InjectDataSource()
        private readonly dataSource: DataSource
    ) { };



    public async save(item: InventoryItem): Promise<void> {
        const { 
            item: itemRow, 
            batch: batchRow, 
            stock: stockRow 
        } = InventoryItemPersistenceMapper.toPersistence(item);

        await this.items.save(itemRow);

        if (batchRow.length > 0) {
            await this.batches.save(batchRow);
        };

        if (stockRow.length > 0) {
            await this.stocks.save(stockRow);
        };
    };



    public async findById(id: InventoryItemId, branchId?: string): Promise<InventoryItem | null> {
        const row = await this.items.findOne({ where: { id: id.value } });
        if (row === null) return null;

        const batchRows = await this.activeBatchesOf([row.id], branchId);
        const stockRows = await this.stocksOf([row.id], branchId);

        return InventoryItemPersistenceMapper.toAggregate(row, batchRows, stockRows);
    };



    public async search(branchId?: string): Promise<InventoryItem[]> {
        const rows = await this.items.find();
        if (rows.length === 0) return [];

        const batchRows = await this.activeBatchesOf(rows.map((r) => r.id), branchId);
        const groupedBatch = this.groupByItemBatch(batchRows);

        const stockRows = await this.stocksOf(rows.map((s) => s.id), branchId);
        const groupedStock = this.groupByItemStock(stockRows)

        return rows.map((row) =>
            InventoryItemPersistenceMapper.toAggregate(
                row, 
                groupedBatch.get(row.id) ?? [],
                groupedStock.get(row.id) ?? []
            ),
        );
    };



    public async existsByName(name: InventoryItemName): Promise<boolean> {
        return (await this.items.count({ where: { name: name.value } })) > 0;
    };



    /** Solo lotes ACTIVOS: con existencias y no vencidos. */
    private async activeBatchesOf(itemIds: string[], branchId?: string): Promise<InventoryBatchEntity[]> {
        const query = this.batches.createQueryBuilder('b')
            .where('b.inventoryItemId IN (:...itemIds)', { itemIds })
            .andWhere('b.quantityRemaining > 0')

        if (branchId !== undefined) {
            query.andWhere('b.branchId = :branchId', { branchId });
        };

        return query.getMany();
    };


    /**
     * Overrides de mínimo por sucursal. Si se pasa branchId, solo el de esa sede
     * (basta para resolver su mínimo efectivo); si no, todos los del item.
     */
    private async stocksOf(itemIds: string[], branchId?: string): Promise<InventoryStockEntity[]> {
        const query = this.stocks.createQueryBuilder('s')
            .where('s.inventoryItemId IN (:...itemIds)', { itemIds });

        if (branchId !== undefined) {
            query.andWhere('s.branchId = :branchId', { branchId });
        };

        return query.getMany();
    };



    private groupByItemBatch(rows: InventoryBatchEntity[]): Map<string, InventoryBatchEntity[]> {
        const map = new Map<string, InventoryBatchEntity[]>();

        for (const row of rows) {
            const list = map.get(row.inventoryItemId) ?? [];

            list.push(row);
            map.set(row.inventoryItemId, list);
        };

        return map;
    };



    private groupByItemStock(rows: InventoryStockEntity[]): Map<string, InventoryStockEntity[]> {
        const map = new Map<string, InventoryStockEntity[]>();

        for (const row of rows) {
            const list = map.get(row.inventoryItemId) ?? [];

            list.push(row);
            map.set(row.inventoryItemId, list);
        };

        return map;
    };


    public async nextSkuSequence(): Promise<number> {
        const rows: Array<{ n: string }> = await this.dataSource.query(
            "SELECT nextval('inventory_item_sku_seq') AS n"
        );

        const first = rows[0];

        if (first === undefined) {
            throw new Error('No se pudo obtener el siguiente valor de la secuencia de SKU.');
        };

        return Number(first.n);
    };
};