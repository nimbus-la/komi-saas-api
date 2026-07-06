import { Money } from "@/shared";
import { InventoryItemNameAlreadyExistsException, InventoryItemNotFoundException } from "../../domain/exceptions/inventory-item.exceptions";
import { InventoryItemRepository } from "../../domain/inventory-item.repository";
import { InventoryItemId } from "../../domain/value-objects/inventory-item-id.value-object";
import { InventoryItemName } from "../../domain/value-objects/inventory-item-name.value-object";
import { InventoryItemUnit } from "../../domain/value-objects/inventory-item-unit.value-object";

export interface UpdateInventoryItemParams {
    name?: string;
    costAmount?: string;
    costCurrency?: string;
    unitOfMeasure?: string;
    isPerishable?: boolean;
};

export class UpdateInventoryItemUseCase {
    constructor(
        private readonly repository: InventoryItemRepository,
    ) { };

    public async execute(itemId: string, params: UpdateInventoryItemParams): Promise<void> {
        const item = await this.repository.findById(InventoryItemId.create(itemId));

        if (item === null) {
            throw new InventoryItemNotFoundException(itemId);
        };

        // Si cambia el nombre, valida unicidad (excepto si es el mismo item).
        let name: InventoryItemName | undefined;

        if (params.name !== undefined) {
            name = InventoryItemName.create(params.name);

            if (await this.repository.existsByName(name)) {
                throw new InventoryItemNameAlreadyExistsException(params.name);
            };
        };

        item.update({
            ...(name ? { name } : {}),
            ...(params.costAmount !== undefined
                ? { costAmount: Money.of(params.costAmount, params.costCurrency ?? 'COP') }
                : {}),
            ...(params.unitOfMeasure !== undefined
                ? { unitOfMeasure: InventoryItemUnit.create(params.unitOfMeasure) }
                : {}),
            ...(params.isPerishable !== undefined
                ? { isPerishable: params.isPerishable }
                : {}),
        });

        await this.repository.save(item);
    };
};