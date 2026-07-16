import { Money, Quantity } from "@/shared";

import { InventoryMovement, InventoryMovementRepository, InventoryMovementType } from "../../../domain";
import { RecordMovementParams } from "../../dtos/inventory-movement.application";


export class RecordMovementUseCase {
    constructor(
        private readonly repository: InventoryMovementRepository
    ) { };


    public async execute(params: RecordMovementParams): Promise<void> {
        const { tenantId, inventoryItemId, branchId, batchId, movementType, quantity, unitCostAmount, unitCostCurrency, reason, occurredAt } = params;

        const unitCost = unitCostAmount && unitCostCurrency
            ? Money.of(unitCostAmount, unitCostCurrency)
            : null

        const movement = InventoryMovement.create({
            tenantId,
            inventoryItemId,
            branchId,
            batchId: batchId ?? null,
            movementType: InventoryMovementType.created(movementType),
            quantity: Quantity.of(quantity),
            unitCost,
            reason: reason ?? null,
            ...(occurredAt ? { occurredAt } : {}),
        });

        await this.repository.save(movement);
    };
};