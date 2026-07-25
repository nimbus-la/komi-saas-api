import { InventoryBatchPrimitives, InventoryItemPrimitives, InventoryBranchConfigPrimitives, InventoryItem } from "../../../domain";
import { InventoryBatchEntity } from "../models/inventory-batch.entity";
import { InventoryItemEntity } from "../models/inventory-item.entity";
import { InventoryBranchConfigEntity } from "../models/inventory-branch-config.entity";

/**
 * Traduce entre el agregado de dominio (InventoryItem) y las entidades de
 * persistencia (TypeORM). Vive en infraestructura porque conoce las entidades
 * de la base; centraliza el mapeo para que el repositorio quede legible.
 */
export class InventoryItemPersistenceMapper {

    /**
     * De persistencia a dominio: reconstruye el agregado a partir de la fila del
     * item y sus filas de lotes (solo los activos, ya filtrados por el repo).
     */
    public static toAggregate(itemRow: InventoryItemEntity, batchRows: InventoryBatchEntity[], branchConfigRows: InventoryBranchConfigEntity[],) {
        const primitives: InventoryItemPrimitives = {
            id: itemRow.id,
            tenantId: itemRow.tenantId,
            sku: itemRow.sku,
            name: itemRow.name,
            unitOfMeasure: itemRow.unitOfMeasure,
            isPerishable: itemRow.isPerishable,
            isActive: itemRow.isActive,
            minGlobalStock: itemRow.minGlobalStock,
            createdAt: itemRow.createdAt,
            updatedAt: itemRow.updatedAt,
            batches: batchRows.map(
                (batch: InventoryBatchEntity): InventoryBatchPrimitives => ({
                    id: batch.id,
                    branchId: batch.branchId,
                    quantityReceived: batch.quantityReceived,
                    quantityRemaining: batch.quantityRemaining,
                    unitCostAmount: batch.unitCostAmount,
                    unitCostCurrency: batch.unitCostCurrency,
                    expirationDate: batch.expirationDate ? batch.expirationDate.toISOString() : null,
                    receivedAt: batch.receivedAt,
                })
            ),
            branchConfigs: branchConfigRows.map(
                (config: InventoryBranchConfigEntity): InventoryBranchConfigPrimitives => ({
                    id: config.id,
                    branchId: config.branchId,
                    minStock: config.minStock,
                })
            ),
        };

        return InventoryItem.fromPrimitives(primitives);
    };


    /**
     * De dominio a persistencia: descompone el agregado en la fila del item y
     * las filas de sus lotes (con la FK inventoryItemId puesta). El repositorio
     * las guarda en sus tablas respectivas.
     */
    public static toPersistence(item: InventoryItem): { item: InventoryItemEntity, batch: InventoryBatchEntity[], branchConfig: InventoryBranchConfigEntity[]; } {
        const { id, tenantId, sku, name, unitOfMeasure, isPerishable, isActive, batches, minGlobalStock, branchConfigs, createdAt, updatedAt } = item.toPrimitives();

        const itemRow: InventoryItemEntity = {
            id,
            tenantId,
            sku,
            name,
            unitOfMeasure,
            isPerishable,
            isActive,
            minGlobalStock,
            createdAt,
            updatedAt,
        };

        const batchRows: InventoryBatchEntity[] = batches.map(
            (batch: InventoryBatchPrimitives) => ({
                id: batch.id,
                branchId: batch.branchId,
                inventoryItemId: id,
                quantityReceived: batch.quantityReceived,
                quantityRemaining: batch.quantityRemaining,
                unitCostAmount: batch.unitCostAmount,
                unitCostCurrency: batch.unitCostCurrency,
                expirationDate: batch.expirationDate ? new Date(batch.expirationDate) : null,
                receivedAt: batch.receivedAt,
            })
        );

        const branchConfigRows: InventoryBranchConfigEntity[] = branchConfigs.map(
            (config: InventoryBranchConfigPrimitives) => ({
                id: config.id,
                inventoryItemId: id,
                branchId: config.branchId,
                minStock: config.minStock,
            })
        );

        return { item: itemRow, batch: batchRows, branchConfig: branchConfigRows };
    };
};
