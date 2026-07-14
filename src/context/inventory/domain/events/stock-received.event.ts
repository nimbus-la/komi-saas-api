import { DomainEvent } from "@/shared";
import { StockReceivedEventParams } from "../types/events.types";

export class StockReceivedEvent extends DomainEvent {
    public readonly eventName = 'inventory.stock.received';

    public readonly itemId: string;
    public readonly tenantId: string;
    public readonly branchId: string;
    public readonly batchId: string;
    public readonly quantity: string;
    public readonly unitCostAmount: string;
    public readonly unitCostCurrency: string;

    constructor(params: StockReceivedEventParams) {
        const { itemId, tenantId, branchId, batchId, quantity, unitCostAmount, unitCostCurrency, occurredOn } = params;

        super(occurredOn);

        this.itemId = itemId;
        this.tenantId = tenantId;
        this.branchId = branchId;
        this.batchId = batchId;
        this.quantity = quantity;
        this.unitCostAmount = unitCostAmount;
        this.unitCostCurrency = unitCostCurrency;
    };
};