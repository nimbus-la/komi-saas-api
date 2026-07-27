import { Injectable } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";

import { DataSource, EntityManager, Repository } from "typeorm";

import { Paginated, Pagination } from "@/interfaces";
import { InventoryItemRepository, InventoryItem, InventoryItemId, InventoryItemName } from "../../../domain";
import { InventoryItemEntity } from "../models/inventory-item.entity";
import { InventoryBatchEntity } from "../models/inventory-batch.entity";
import { InventoryItemPersistenceMapper } from "../mappers/inventory-item.persistence-mapper";
import { InventoryBranchConfigEntity } from "../models/inventory-branch-config.entity";


@Injectable()
export class TypeOrmInventoryItemRepository implements InventoryItemRepository {
    constructor(
        @InjectRepository(InventoryItemEntity)
        private readonly items: Repository<InventoryItemEntity>,

        @InjectRepository(InventoryBatchEntity)
        private readonly batches: Repository<InventoryBatchEntity>,

        @InjectRepository(InventoryBranchConfigEntity)
        private readonly branchConfigs: Repository<InventoryBranchConfigEntity>,

        @InjectDataSource()
        private readonly dataSource: DataSource
    ) { };



    public async save(item: InventoryItem): Promise<void> {
        const {
            item: itemRow,
            batch: batchRow,
            branchConfig: branchConfigRow
        } = InventoryItemPersistenceMapper.toPersistence(item);

        // Todo en una transaccion: si algo falla, no queda el item guardado con
        // sus hijos a medias.
        await this.dataSource.transaction(
            async (manager: EntityManager) => {
                await manager.getRepository(InventoryItemEntity).save(itemRow);

                if (batchRow.length > 0) {
                    await manager.getRepository(InventoryBatchEntity).save(batchRow);
                };

                // Los overrides de minimo se ELIMINAN cuando el usuario los quita
                // (minStock null), asi que no basta con guardar: hay que borrar los que
                // ya no estan en el agregado. save() solo inserta y actualiza; las filas
                // ausentes de la coleccion sobrevivirian en la tabla y la sucursal
                // seguiria usando un override que el usuario ya elimino.
                //
                // OJO: solo se reconcilia si el agregado se cargo con TODOS los
                // overrides (sin filtrar por sucursal). Si se cargo por sede, borrar los
                // ausentes eliminaria los de las demas sucursales.
                const branchConfigsRepo = manager.getRepository(InventoryBranchConfigEntity);
                const keptIds = branchConfigRow.map((config) => config.id);

                await branchConfigsRepo
                    .createQueryBuilder()
                    .delete()
                    .where('inventory_item_id = :itemId', { itemId: itemRow.id })
                    .andWhere(keptIds.length > 0 ? 'inventory_branch_config_id NOT IN (:...keptIds)' : '1 = 1', { keptIds })
                    .execute();

                if (branchConfigRow.length > 0) {
                    await branchConfigsRepo.save(branchConfigRow);
                };
            }
        );
    };



    public async findById(id: InventoryItemId, tenantId: string, branchId?: string): Promise<InventoryItem | null> {
        const row = await this.items.findOne({ where: { id: id.value, tenantId } });
        if (row === null) return null;

        const batchRows = await this.activeBatchesOf([row.id], branchId);
        const branchConfigRows = await this.branchConfigsOf([row.id], branchId);

        return InventoryItemPersistenceMapper.toAggregate(row, batchRows, branchConfigRows);
    };



    public async search(tenantId: string, pagination: Pagination, branchId?: string): Promise<Paginated<InventoryItem>> {
        const [rows, total] = await this.items.findAndCount({
            where: { tenantId },
            order: { createdAt: 'DESC' },
            skip: (pagination.pageNumber - 1) * pagination.pageSize,
            take: pagination.pageSize,
        });

        if (rows.length === 0) {
            return { data: [], pageNumber: pagination.pageNumber, pageSize: pagination.pageSize, total };
        };

        const batchRows = await this.activeBatchesOf(rows.map((r) => r.id), branchId);
        const groupedBatch = this.groupByItemBatch(batchRows);

        const branchConfigRows = await this.branchConfigsOf(rows.map((s) => s.id), branchId);
        const groupedBranchConfig = this.groupByItemBranchConfig(branchConfigRows)

        const data = rows.map((row) =>
            InventoryItemPersistenceMapper.toAggregate(
                row,
                groupedBatch.get(row.id) ?? [],
                groupedBranchConfig.get(row.id) ?? []
            ),
        );

        return { data, pageNumber: pagination.pageNumber, pageSize: pagination.pageSize, total };
    };



    public async existsByName(name: InventoryItemName, tenantId: string): Promise<boolean> {
        return (await this.items.count({ where: { name: name.value, tenantId } })) > 0;
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
    private async branchConfigsOf(itemIds: string[], branchId?: string): Promise<InventoryBranchConfigEntity[]> {
        const query = this.branchConfigs.createQueryBuilder('c')
            .where('c.inventoryItemId IN (:...itemIds)', { itemIds });

        if (branchId !== undefined) {
            query.andWhere('c.branchId = :branchId', { branchId });
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



    private groupByItemBranchConfig(rows: InventoryBranchConfigEntity[]): Map<string, InventoryBranchConfigEntity[]> {
        const map = new Map<string, InventoryBranchConfigEntity[]>();

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
