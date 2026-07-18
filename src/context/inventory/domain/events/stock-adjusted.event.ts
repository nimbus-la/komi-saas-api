import { DomainEvent } from "@/shared";
import { AdjustedBatchDetail } from "../types/domain.types";

export class StockAdjustedEvent extends DomainEvent {
    public readonly eventName = 'inventory.stock.adjusted';

    public readonly itemId: string;
    public readonly tenantId: string;
    public readonly branchId: string;
    public readonly reason: string;
    public readonly adjustedBatches: ReadonlyArray<AdjustedBatchDetail>;

    constructor(props: {
        itemId: string;
        tenantId: string;
        branchId: string;
        reason: string;
        adjustedBatches: AdjustedBatchDetail[];
        occurredOn: Date;
    }) {
        super(props.occurredOn);

        this.itemId = props.itemId;
        this.tenantId = props.tenantId;
        this.branchId = props.branchId;
        this.reason = props.reason;
        this.adjustedBatches = props.adjustedBatches;
    };
};