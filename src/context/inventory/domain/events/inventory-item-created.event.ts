import { DomainEvent } from "@/shared";

import { InventoryItemCreatedProps } from "../types/domain.types";


export class InventoryItemCreatedEvent extends DomainEvent {
    public readonly tenantId: string;
    public readonly sku: string;
    public readonly name: string;
    public readonly unitOfMeasure: string;
    public readonly isPerishable: boolean;
    public readonly costAmount: string;
    public readonly costCurrency: string;
    public readonly isActive: boolean;
    public readonly createdAt: Date;
    public readonly updatedAt: Date;

    constructor(props: InventoryItemCreatedProps) {
        super();

        this.tenantId = props.tenantId;
        this.sku = props.sku;
        this.name = props.name;
        this.unitOfMeasure = props.unitOfMeasure;
        this.isPerishable = props.isPerishable;
        this.costAmount = props.costAmount;
        this.costCurrency = props.costCurrency;
        this.isActive = props.isActive;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    };
};