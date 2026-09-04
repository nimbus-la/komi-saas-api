import { OnEvent } from "@nestjs/event-emitter";
import { Injectable } from "@nestjs/common";
import { PinoLogger } from "nestjs-pino";

import { DomainEvent } from "@/shared/domain/domain-event";
import { sanitize } from "@/infrastructure/logging/sanitizer.util";

// Por ruta directa y no desde el barrel `../../../../inventory`, que arrastra
// el controlador de inventario y con él `@nestjs/jwt`. Ese solo publica ESM y
// dejaba este archivo fuera del alcance de una prueba unitaria.
import { StockReceivedEvent } from "@/context/inventory/domain/events/stock-received.event";
import { StockConsumedEvent } from "@/context/inventory/domain/events/stock-consumed.event";
import { StockWastedEvent } from "@/context/inventory/domain/events/stock-wasted.event";
import { StockAdjustedEvent } from "@/context/inventory/domain/events/stock-adjusted.event";

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
    constructor(
        private readonly recordMovement: RecordMovementUseCase,
        private readonly logger: PinoLogger
    ) {
        this.logger.setContext(StockMovementHandlers.name);
    };


    @OnEvent('inventory.stock.received')
    public async onStockReceived(event: StockReceivedEvent): Promise<void> {
        let movement: RecordMovementParams | null = null;

        try {
            movement = {
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

            await this.recordMovement.execute(movement);

        } catch (error: unknown) {
            this.logAuditFailure(
                MovementType.Entry,
                event,
                movement === null ? [] : [movement],
                error
            );
        };
    };


    @OnEvent('inventory.stock.consumed')
    public async onStockConsumed(event: StockConsumedEvent): Promise<void> {
        await this.record(MovementType.Consumption, event, () => event.consumedBatches.map(
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
        ));
    };



    @OnEvent('inventory.stock.wasted')
    public async onStockWasted(event: StockWastedEvent): Promise<void> {
        await this.record(MovementType.Waste, event, () => event.wastedBatches.map((detail) => ({
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
        })));
    };



    @OnEvent('inventory.stock.adjusted')
    public async onStockAdjusted(event: StockAdjustedEvent): Promise<void> {
        await this.record('AJUSTE', event, () => event.adjustedBatches.map((detail) => ({
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
        })));
    };



    /**
     * Arma la tanda de movimientos y la registra.
     *
     * Este método existe para que el armado quede dentro del `try`. Antes se
     * hacía fuera, así que un evento que llegara sin su lista de lotes reventaba
     * el `.map` antes de cualquier `catch`, el error subía hasta el publicador y
     * de ahí a la petición, que respondía 500 con el stock ya movido. Y si eso
     * pasaba fuera del ciclo HTTP se perdía entero.
     */
    private async record(
        operation: string,
        event: DomainEvent,
        build: () => Array<Parameters<RecordMovementUseCase['execute']>[0]>
    ): Promise<void> {
        let movements: Array<Parameters<RecordMovementUseCase['execute']>[0]> = [];

        try {
            movements = build();

            await this.recordAll(operation, event, movements);

        } catch (error: unknown) {
            this.logAuditFailure(operation, event, movements, error);
        };
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
        event: DomainEvent,
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
            this.logAuditFailure(operation, event, failed, lastError, movements.length);
        };
    };



    /**
     * Deja constancia de que el stock cambió pero su movimiento no quedó
     * registrado.
     *
     * Los movimientos que faltaron van como campo y no dentro del texto, para
     * poder sacarlos con un `jq` y rehacerlos con un script en vez de
     * recortarlos a mano. El evento entero viaja también, porque cuando lo que
     * falla es el armado no hay ningún movimiento que adjuntar.
     *
     * Esta línea debería estar conectada a alertas. Un fallo aquí significa que
     * la bitácora dejó de reflejar la realidad del inventario.
     */
    private logAuditFailure(
        operation: string,
        event: DomainEvent,
        failedMovements: unknown[],
        error: unknown,
        totalMovements?: number
    ): void {
        const scope = totalMovements !== undefined
            ? `${failedMovements.length} de ${totalMovements} movimiento(s)`
            : `${failedMovements.length} movimiento(s)`;

        this.logger.error(
            {
                event: event.eventName,
                occurredOn: event.occurredOn,

                // Se sanean los dos porque se escriben enteros para poder
                // rehacer la fila a mano, así que pasan por la misma lista que
                // el cuerpo de una petición.
                failedMovements: sanitize(failedMovements),
                payload: sanitize(event),
                err: error,
            },
            `[AUDITORIA INCOMPLETA] ${operation}: el stock se actualizó pero NO se registraron `
            + `${scope}. Reconstruir con los movimientos adjuntos.`,
        );
    };
};