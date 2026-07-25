import { Money } from "@/shared";
import { InventoryItemId, InventoryItemName, InventoryItemNameAlreadyExistsException, InventoryItemNotFoundException, InventoryItemRepository, InventoryItemUnit } from "../../../domain";
import { UpdateInventoryItemParams } from "../../dtos/inventory-item.params";

export class UpdateInventoryItemUseCase {
    constructor(
        private readonly repository: InventoryItemRepository,
    ) { };

    public async execute(itemId: string, tenantId: string, params: UpdateInventoryItemParams): Promise<void> {
        const item = await this.repository.findById(InventoryItemId.create(itemId), tenantId);

        if (item === null) {
            throw new InventoryItemNotFoundException(itemId);
        };

        // Si cambia el nombre, valida unicidad (excepto si es el mismo item).
        let name: InventoryItemName | undefined;

        if (params.name !== undefined) {
            name = InventoryItemName.create(params.name);

            if (await this.repository.existsByName(name, tenantId)) {
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