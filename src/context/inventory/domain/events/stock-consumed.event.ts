import { DomainEvent } from "@/shared";
import { StockConsumeEventParams } from "../types/events.types";
import { ConsumedBatchDetail } from "../types/domain.types";

export class StockConsumedEvent extends DomainEvent {
    public readonly eventName = 'inventory.item.consumed';

    public readonly itemId: string;
    public readonly tenantId: string;
    public readonly branchId: string;
    public readonly quantity: string;
    public readonly consumedBatches: ReadonlyArray<ConsumedBatchDetail>;

    constructor(params: StockConsumeEventParams) {
        const { itemId, tenantId, branchId, quantity, consumedBatches, occurredOn } = params;

        super(occurredOn);

        this.itemId = itemId;
        this.tenantId = tenantId;
        this.branchId = branchId;
        this.quantity = quantity;
        this.consumedBatches = consumedBatches;
    };
};