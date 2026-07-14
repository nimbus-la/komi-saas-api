import { OnEvent } from "@nestjs/event-emitter";
import { Injectable, Logger } from "@nestjs/common";

import { StockConsumedEvent, StockReceivedEvent } from "../../../../inventory";

import { RecordMovementUseCase } from "../../../application";
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
        try {
            await this.recordMovement.execute({
                tenantId: event.tenantId,
                inventoryItemId: event.itemId,
                branchId: event.branchId,
                movementType: MovementType.Entry,
                quantity: event.quantity,
                unitCostAmount: event.unitCostAmount,
                unitCostCurrency: event.unitCostCurrency,
                occurredAt: event.occurredOn,
            });
        } catch (error) {
            this.logger.error(`No se pudo registrar el movimiento de entrada del item ${event.itemId}`, error);
        };
    };


    @OnEvent('inventory.stock.consumed')
    public async onStockConsumed(event: StockConsumedEvent): Promise<void> {
        try {
            await this.recordMovement.execute({
                tenantId: event.tenantId,
                inventoryItemId: event.itemId,
                branchId: event.branchId,
                movementType: MovementType.Consumption,
                quantity: event.quantity,
                occurredAt: event.occurredOn,
            });

        } catch (error) {
            this.logger.error(`No se pudo registrar el movimiento de consumo del item ${event.itemId}`, error);
        };
    };
};