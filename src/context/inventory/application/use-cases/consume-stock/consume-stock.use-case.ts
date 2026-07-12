import { EventPublisher, Quantity } from "@/shared";
import { InventoryItemId, InventoryItemNotFoundException, InventoryItemRepository } from "../../../domain";


export interface ConsumeStockParams {
    itemId: string;
    branchId: string;
    quantity: string;
    consumedAt?: string;
};


export class ConsumeStockUseCase {
    constructor(
        private readonly repository: InventoryItemRepository,
        private readonly eventPublisher: EventPublisher
    ) { };

    public async execute(params: ConsumeStockParams): Promise<void> {
        const item = await this.repository.findById(
            InventoryItemId.create(params.itemId),
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