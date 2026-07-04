import { AggregateRoot, Money } from "@/shared";

import { InventoryItemId } from "./value-objects/inventory-item-id.value-object";
import { InventoryItemName } from "./value-objects/inventory-item-name.value-object";
import { InventoryItemUnit } from "./value-objects/inventory-item-unit.value-object";
import { InventoryItemCreatedEvent } from "./events/inventory-item-created.event";

export class InventoryItem extends AggregateRoot<InventoryItemId> {
    private name: InventoryItemName;
    private unitOfMeasure: InventoryItemUnit;
    private costAmount: Money;
    private isPerishable: boolean;
    private isActive: boolean;
    private createdAt: Date;
    private updatedAt: Date;


    private constructor(
        id: InventoryItemId,
        name: InventoryItemName,
        unitOfMeasure: InventoryItemUnit,
        costAmount: Money,
        isPerishable: boolean,
        isActive: boolean,
        createdAt: Date
    ) {
        super(id);

        this.name = name;
        this.unitOfMeasure = unitOfMeasure;
        this.isPerishable = isPerishable;
        this.costAmount = costAmount;
        this.isActive = isActive;
        this.createdAt = createdAt;
    };


    public static createItem(params: {
        name: InventoryItemName;
        unitOfMeasure: InventoryItemUnit;
        costAmount: Money;
        isPerishable: boolean;
        createdAt: Date
    }): InventoryItem {
        const item = new InventoryItem(
            InventoryItemId.generate(),
            params.name,
            params.unitOfMeasure,
            params.costAmount,
            params.isPerishable,
            true,
            params.createdAt
        );

        item.registerEvent(
            new InventoryItemCreatedEvent({
                itemId: item.id.value,
                name: item.name.value,
                unitOfMeasure: item.unitOfMeasure.value,
                costAmount: item.costAmount.getAmount(),
                costCurrency: item.costAmount.currency,
                isPerishable: item.isPerishable,
                isActive: item.isActive,
                createdAt: item.createdAt
            })
        );

        return item;
    };


    public desactivate(): void {
        if (!this.isActive) {
            throw new Error('El item se encuentra desactivado.');
        };

        this.isActive = false;
    };


    public activate(): void {
        if (this.isActive) {
            throw new Error('El item se encuentra activado.');
        };

        this.isActive = true;
    };
};