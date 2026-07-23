import { OnEvent } from "@nestjs/event-emitter";
import { Injectable, Logger } from "@nestjs/common";

import { StockConsumedEvent, StockReceivedEvent, StockWastedEvent, StockAdjustedEvent } from "../../../../inventory";

import { RecordMovementParams, RecordMovementUseCase } from "../../../application";
import { MovementType } from "../../../domain";


/**
 * Suscriptores de los hechos del inventario: cada vez que se recibe o consume
 * stock, registran el movimiento correspondiente en la bitácora.
 * El inventario no sabe que esto existe; si el registro falla, se loguea sin
 * romper la operación original (el stock real vive en los lotes).
 */
@Injectable()
export class StockMovementHandlers {
    private readonly logger = new Logger(StockMovementHandlers.name);


    constructor(
        private readonly recordMovement: RecordMovementUseCase
    ) { };


    @OnEvent('inventory.stock.received')
    public async onStockReceived(event: StockReceivedEvent): Promise<void> {
        const movement: RecordMovementParams = {
            tenantId: event.tenantId,
            inventoryItemId: event.itemId,
            branchId: event.branchId,
            batchId: event.batchId,
            movementType: MovementType.Entry,
            quantity: event.quantity,
            unitCostAmount: event.unitCostAmount,
            unitCostCurrency: event.unitCostCurrency,
            occurredAt: event.occurredOn,
        };

        try {
            await this.recordMovement.execute(movement);

        } catch (error: unknown) {
            this.logAuditFailure(
                MovementType.Entry,
                event.eventName,
                [movement],
                error
            );
        };
    };


    @OnEvent('inventory.stock.consumed')
    public async onStockConsumed(event: StockConsumedEvent): Promise<void> {
        const movements = event.consumedBatches.map(
            (detail) => ({
                tenantId: event.tenantId,
                inventoryItemId: event.itemId,
                branchId: event.branchId,
                batchId: detail.batchId,
                movementType: MovementType.Consumption,
                quantity: detail.quantity,
                unitCostAmount: detail.unitCostAmount,
                unitCostCurrency: detail.unitCostCurrency,
                occurredAt: event.occurredOn,
            })
        );

        await this.recordAll(
            MovementType.Consumption,
            event.eventName,
            movements
        );
    };



    @OnEvent('inventory.stock.wasted')
    public async onStockWasted(event: StockWastedEvent): Promise<void> {
        const movements = event.wastedBatches.map((detail) => ({
            tenantId: event.tenantId,
            inventoryItemId: event.itemId,
            branchId: event.branchId,
            batchId: detail.batchId,
            movementType: MovementType.Waste,
            quantity: detail.quantity,
            unitCostAmount: detail.unitCostAmount,
            unitCostCurrency: detail.unitCostCurrency,
            reason: event.reason,
            occurredAt: event.occurredOn,
        }));

        await this.recordAll(
            MovementType.Waste, 
            event.eventName, 
            movements
        );
    };



    @OnEvent('inventory.stock.adjusted')
    public async onStockAdjusted(event: StockAdjustedEvent): Promise<void> {
        const movements = event.adjustedBatches.map((detail) => ({
            tenantId: event.tenantId,
            inventoryItemId: event.itemId,
            branchId: event.branchId,
            batchId: detail.batchId,
            movementType: detail.direction === 'IN'
                ? MovementType.AdjustmentIn
                : MovementType.AdjustmentOut,
            quantity: detail.quantity,
            unitCostAmount: detail.unitCostAmount,
            unitCostCurrency: detail.unitCostCurrency,
            reason: event.reason,
            occurredAt: event.occurredOn,
        }));

        await this.recordAll('AJUSTE', event.eventName, movements);
    };



    /**
     * Registra una tanda de movimientos (un evento puede tocar varios lotes).
     *
     * Cada movimiento se intenta por separado: si el lote 2 falla, el 1 y el 3
     * igual quedan registrados. Es preferible una bitácora parcial —con constancia
     * clara de qué faltó— a perder toda la tanda por un fallo puntual.
     */
    private async recordAll(
        operation: string,
        eventName: string,
        movements: Array<Parameters<RecordMovementUseCase['execute']>[0]>
    ): Promise<void> {
        const failed: Array<Parameters<RecordMovementUseCase['execute']>[0]> = [];
        let lastError: unknown = null;

        for (const movement of movements) {
            try {
                await this.recordMovement.execute(movement);

            } catch (error) {
                failed.push(movement);
                lastError = error;
            };
        };

        if (failed.length > 0) {
            this.logAuditFailure(operation, eventName, failed, lastError, movements.length);
        };
    };



    /**
     * Deja constancia CRÍTICA de que el stock cambió pero su movimiento no quedó
     * registrado. Incluye el payload completo en JSON para poder reconstruir la
     * fila a mano (o con un script) sin adivinar nada.
     *
     * Este log debe estar conectado a alertas: un fallo aquí significa que la
     * bitácora dejó de reflejar la realidad del inventario.
     */
    private logAuditFailure(
        operation: string,
        eventName: string,
        failedMovements: unknown[],
        error: unknown,
        totalMovements?: number
    ): void {
        const scope = totalMovements !== undefined
            ? `${failedMovements.length} de ${totalMovements} movimiento(s)`
            : `${failedMovements.length} movimiento(s)`;

        this.logger.error(
            `[AUDITORIA INCOMPLETA] ${operation}: el stock se actualizó pero NO se registraron ${scope}. ` +
            `Evento: ${eventName}. Reconstruir manualmente con el payload adjunto.\n` +
            `PAYLOAD: ${JSON.stringify(failedMovements)}`,
            error instanceof Error ? error.stack : String(error),
        );
    };
};