import { Money, Quantity } from "@/shared";
import { InventoryItemNotFoundException } from "../../domain/exceptions/inventory-item.exceptions";
import { InventoryItemRepository } from "../../domain/inventory-item.repository";
import { InventoryItemId } from "../../domain/value-objects/inventory-item-id.value-object";
import { InventoryBatchExpirationDate } from "../../domain/entities/inventory-batch/value-objects/inventory-batch-expiration.value-object";


export interface ReceiveStockParams {
    itemId: string;
    quantityReceived: string;
    totalCostAmount: string;
    expirationDate?: string | null;
    receivedAt?: string;
};


export class ReceiveStockUseCase {
    constructor(
        private readonly repository: InventoryItemRepository
    ) { };

    public async execute(params: ReceiveStockParams) {
        const item = await this.repository.findById(InventoryItemId.create(params.itemId));

        if (item === null) {
            throw new InventoryItemNotFoundException(params.itemId);
        };

        const quantityReceived = Quantity.of(params.quantityReceived);
        const currency = item.toPrimitives().costCurrency;
        const unitCost = Money.of(params.totalCostAmount, currency).divide(quantityReceived.getValue());

        item.recivedBatch({
            quantityReceived,
            unitCost,
            expirationDate: params.expirationDate
                ? InventoryBatchExpirationDate.create(params.expirationDate)
                : null,
            ...(params.receivedAt ? { receivedAt: new Date(params.receivedAt) } : {}),
        });

        await this.repository.save(item);
    };
};