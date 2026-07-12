import { DomainEvent } from "@/shared";
import { StockReceivedEventParams } from "../types/events.types";

export class StockReceivedEvent extends DomainEvent {
    public readonly eventName = 'inventory.stock.received';

    public readonly itemId: string;
    public readonly tenantId: string;
    public readonly branchId: string;
    public readonly quantity: string;
    public readonly unitCostAmount: string;
    public readonly unitCostCurrency: string;

    constructor(params: StockReceivedEventParams) {
        const { itemId, tenantId, branchId, quantity, unitCostAmount, unitCostCurrency, occurredOn } = params;

        super(occurredOn);

        this.itemId = itemId;
        this.tenantId = tenantId;
        this.branchId = branchId;
        this.quantity = quantity;
        this.unitCostAmount = unitCostAmount;
        this.unitCostCurrency = unitCostCurrency;
    };
};