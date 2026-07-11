import { InventoryItemRepository } from "../../domain/inventory-item.repository";
import { toInventoryItemResponse } from "../mappers/inventory-item-response.mapper";
import { InventoryItemResponse } from "../types/application.types";

export class SearchInventoryItemsUseCase {
    constructor(
        private readonly repository: InventoryItemRepository
    ) { };

    public async execute(branchId?: string): Promise<InventoryItemResponse[]> {
        const items = await this.repository.search(branchId);
        const now = new Date();

        return items.map((item) =>
            toInventoryItemResponse(item, {
                date: now,
                ...(branchId !== undefined ? { branchId } : {}),
            }),
        );
    };
};