import { EventPublisher, Quantity } from "@/shared";
import { InventoryItemId, InventoryItemNotFoundException, InventoryItemRepository } from "../../../domain";
import { AdjustBatchParams } from "../../dtos/inventory-item.params";

export class AdjustBatchUseCase {
    constructor(
        private readonly repository: InventoryItemRepository,
        private readonly eventPublisher: EventPublisher
    ) { };

    public async execute(params: AdjustBatchParams): Promise<void> {
        const item = await this.repository.findById(InventoryItemId.create(params.itemId));

        if (item === null) {
            throw new InventoryItemNotFoundException(params.itemId);
        };

        item.adjustBatch({
            batchId: params.batchId,
            actualQuantity: Quantity.of(params.actualQuantity),
            reason: params.reason,
            ...(params.occurredAt ? { occurredAt: new Date(params.occurredAt) } : {}),
        });

        await this.repository.save(item);

        await this.eventPublisher.publish(item.getDomainEvents());
        item.clearDomainEvents();
    };
};