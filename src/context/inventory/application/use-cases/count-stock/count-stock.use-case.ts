import { EventPublisher, Quantity } from "@/shared";

import { InventoryItemId, InventoryItemNotFoundException, InventoryItemRepository } from "../../../domain";
import { CountStockParams } from "../../dtos/inventory-item.params";


export class CountStockUseCase {
    constructor(
        private readonly repository: InventoryItemRepository,
        private readonly eventPublisher: EventPublisher
    ) { };

    public async execute(params: CountStockParams): Promise<void> {
        const item = await this.repository.findById(InventoryItemId.create(params.itemId));

        if (item === null) {
            throw new InventoryItemNotFoundException(params.itemId);
        };

        item.countStock({
            branchId: params.branchId,
            actualTotal: Quantity.of(params.actualTotal),
            reason: params.reason,
            ...(params.surplusBatchId ? { surplusBatchId: params.surplusBatchId } : {}),
            ...(params.occurredAt ? { occurredAt: new Date(params.occurredAt) } : {}),
        });

        await this.repository.save(item);

        await this.eventPublisher.publish(item.getDomainEvents());
        item.clearDomainEvents();
    };
};