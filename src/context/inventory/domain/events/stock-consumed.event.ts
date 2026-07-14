import { DomainEvent } from "@/shared";
import { StockConsumeEventParams } from "../types/events.types";

export class StockConsumedEvent extends DomainEvent {
    public readonly eventName = 'inventory.item.consumed';

    public readonly itemId: string;
    public readonly tenantId: string;
    public readonly branchId: string;
    public readonly quantity: string;

    constructor(params: StockConsumeEventParams) {
        const { itemId, tenantId, branchId, quantity, occurredOn } = params;

        super(occurredOn);

        this.itemId = itemId;
        this.tenantId = tenantId;
        this.branchId = branchId;
        this.quantity = quantity;
    };
};