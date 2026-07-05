import { Quantity } from "@/shared";

import { InventoryItemNotFoundException } from "../../domain/exceptions/inventory-item.exceptions";
import { InventoryItemRepository } from "../../domain/inventory-item.repository";
import { InventoryItemId } from "../../domain/value-objects/inventory-item-id.value-object";

export interface ConsumeStockParams {
    itemId: string;
    quantity: string;
    consumedAt?: string;
};


export class ConsumeStockUseCase {
    constructor(
        private readonly repository: InventoryItemRepository
    ) { };

    public async execute(params: ConsumeStockParams): Promise<void> {
        const item = await this.repository.findById(InventoryItemId.create(params.itemId));

        if (item === null) {
            throw new InventoryItemNotFoundException(params.itemId);
        };

        item.consume(
            Quantity.of(params.quantity),
            params.consumedAt ? new Date(params.consumedAt) : undefined
        );

        await this.repository.save(item);
    };
};