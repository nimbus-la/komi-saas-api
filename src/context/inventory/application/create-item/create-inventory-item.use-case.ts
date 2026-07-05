
import { Money } from "@/shared";

import { InventoryItem } from "../../domain/inventory-item.aggregate";
import { InventoryItemRepository } from "../../domain/inventory-item.repository";
import { InventoryItemNameAlreadyExistsException } from "../../domain/exceptions/inventory-item.exceptions";
import { InventoryItemName } from "../../domain/value-objects/inventory-item-name.value-object";
import { InventoryItemUnit } from "../../domain/value-objects/inventory-item-unit.value-object";

export interface CreateInventoryItemParams {
    name: string;
    unitOfMeasure: string;
    costAmount: string;
    costCurrency?: string;
    isPerishable: boolean;
};


export class CreateInventoryItemUseCase {
    constructor(
        private readonly repository: InventoryItemRepository
    ) { };

    public async execute(params: CreateInventoryItemParams): Promise<void> {
        const name = InventoryItemName.create(params.name);

        if (await this.repository.existsByName(name)) {
            throw new InventoryItemNameAlreadyExistsException(params.name);
        };

        const item = InventoryItem.create({
            name,
            unitOfMeasure: InventoryItemUnit.create(params.unitOfMeasure),
            costAmount: Money.of(params.costAmount, params.costCurrency ?? 'COP'),
            isPerishable: params.isPerishable,
            createdAt: new Date()
        });

        await this.repository.save(item);
    };
};