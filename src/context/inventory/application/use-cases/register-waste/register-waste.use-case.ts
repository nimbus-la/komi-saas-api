import { EventPublisher, Quantity } from "@/shared";
import { InventoryItemId, InventoryItemNotFoundException, InventoryItemRepository } from "../../../domain";
import { RegisterWasteUseCaseParams } from "../../dtos/inventory-item.params";

export class RegisterWasteUseCase {
    constructor(
        private readonly repository: InventoryItemRepository,
        private readonly eventPublisher: EventPublisher
    ) { };

    public async execute(params: RegisterWasteUseCaseParams): Promise<void> {
        const item = await this.repository.findById(
            InventoryItemId.create(params.itemId)
        );

        if (item === null) {
            throw new InventoryItemNotFoundException(params.itemId);
        };

        item.registerWaste({
            branchId: params.branchId,
            quantity: Quantity.of(params.quantity),
            reason: params.reason,
            ...(params.occurredAt ? { occurredAt: new Date(params.occurredAt) } : {}),
        });

        await this.repository.save(item);

        await this.eventPublisher.publish(item.getDomainEvents());
        item.clearDomainEvents();
    };
};