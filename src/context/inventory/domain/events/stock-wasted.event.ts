import { DomainEvent } from "@/shared";
import { WastedBatchDetail } from "../types/domain.types";


/**
 * Se registró una MERMA: producto perdido físicamente (caída, derrame, daño).
 * Lleva el detalle por lote porque el reparto FEFO puede tocar varios, y cada uno
 * aporta su propio costo real.
 */
export class StockWastedEvent extends DomainEvent {
    public readonly eventName = 'inventory.stock.wasted';

    public readonly itemId: string;
    public readonly tenantId: string;
    public readonly branchId: string;
    public readonly reason: string;
    public readonly wastedBatches: ReadonlyArray<WastedBatchDetail>;

    constructor(props: {
        itemId: string;
        tenantId: string;
        branchId: string;
        reason: string;
        wastedBatches: WastedBatchDetail[];
        occurredOn: Date;
    }) {
        super(props.occurredOn);

        this.itemId = props.itemId;
        this.tenantId = props.tenantId;
        this.branchId = props.branchId;
        this.reason = props.reason;
        this.wastedBatches = props.wastedBatches;
    };
};