import { EventPublisher, Quantity } from "@/shared";

import { InventoryItemId, InventoryItemNotFoundException, InventoryItemRepository } from "../../../domain";
import { ConsumeStockParams } from "../../dtos/inventory-item.params";


export class ConsumeStockUseCase {
    constructor(
        private readonly repository: InventoryItemRepository,
        private readonly eventPublisher: EventPublisher
    ) { };

    public async execute(params: ConsumeStockParams): Promise<void> {
        const item = await this.repository.findById(
            InventoryItemId.create(params.itemId),
            params.tenantId,
            params.branchId
        );

        if (item === null) {
            throw new InventoryItemNotFoundException(params.itemId);
        };

        item.consume(
            Quantity.of(params.quantity),
            params.consumedAt ? new Date(params.consumedAt) : undefined
        );

        await this.repository.save(item);

        await this.eventPublisher.publish(item.getDomainEvents());
        item.clearDomainEvents();
    };
};