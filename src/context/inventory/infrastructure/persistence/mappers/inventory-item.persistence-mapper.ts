import { InventoryBatchPrimitives, InventoryItemPrimitives } from "@/context/inventory/domain/types/domain.types";
import { InventoryBatchEntity } from "../entities/inventory-batch.entity";
import { InventoryItemEntity } from "../entities/inventory-item.entity";
import { InventoryItem } from "@/context/inventory/domain/inventory-item.aggregate";

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
    public static toAggregate(itemRow: InventoryItemEntity, batchRows: InventoryBatchEntity[]) {
        const primitives: InventoryItemPrimitives = {
            id: itemRow.id,
            tenantId: itemRow.tenantId,
            sku: itemRow.sku,
            name: itemRow.name,
            unitOfMeasure: itemRow.unitOfMeasure,
            costAmount: itemRow.costAmount,
            costCurrency: itemRow.costCurrency,
            isPerishable: itemRow.isPerishable,
            isActive: itemRow.isActive,
            createdAt: itemRow.createdAt,
            updatedAt: itemRow.updatedAt,
            batches: batchRows.map(
                (batch: InventoryBatchEntity): InventoryBatchPrimitives => ({
                    id: batch.id,
                    quantityReceived: batch.quantityReceived,
                    quantityRemaining: batch.quantityRemaining,
                    unitCostAmount: batch.unitCostAmount,
                    unitCostCurrency: batch.unitCostCurrency,
                    expirationDate: batch.expirationDate ? batch.expirationDate.toISOString() : null,
                    receivedAt: batch.receivedAt,
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
    public static toPersistence(item: InventoryItem): { item: InventoryItemEntity, batch: InventoryBatchEntity[] } {
        const { id, tenantId, sku, name, unitOfMeasure, costAmount, costCurrency, isPerishable, isActive, batches, createdAt, updatedAt } = item.toPrimitives();

        const itemRow: InventoryItemEntity = {
            id,
            tenantId,
            sku,
            name,
            unitOfMeasure,
            costAmount,
            costCurrency,
            isPerishable,
            isActive,
            createdAt,
            updatedAt,
        };

        const batchRows: InventoryBatchEntity[] = batches.map(
            (batch: InventoryBatchPrimitives) => ({
                id: batch.id,
                inventoryItemId: id,
                quantityReceived: batch.quantityReceived,
                quantityRemaining: batch.quantityRemaining,
                unitCostAmount: batch.unitCostAmount,
                unitCostCurrency: batch.unitCostCurrency,
                expirationDate: batch.expirationDate ? new Date(batch.expirationDate) : null,
                receivedAt: batch.receivedAt,
            })
        );

        return { item: itemRow, batch: batchRows };
    };
};