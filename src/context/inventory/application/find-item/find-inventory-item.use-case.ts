import { InventoryItemNotFoundException } from "../../domain/exceptions/inventory-item.exceptions";
import { InventoryItemRepository } from "../../domain/inventory-item.repository";
import { InventoryItemId } from "../../domain/value-objects/inventory-item-id.value-object";
import { toInventoryItemResponse } from "../mappers/inventory-item-response.mapper";
import { InventoryItemResponse } from "../types/application.types";

export class FindInventoryItemUseCase {
    constructor(
        private readonly repository: InventoryItemRepository
    ) { };

    public async execute(itemId: string, branchId?: string): Promise<InventoryItemResponse> {
        const item = await this.repository.findById(InventoryItemId.create(itemId), branchId);

        if (item === null) {
            throw new InventoryItemNotFoundException(itemId);
        };

        return toInventoryItemResponse(item);
    };
};