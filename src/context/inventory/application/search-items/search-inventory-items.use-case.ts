import { InventoryItemRepository } from "../../domain/inventory-item.repository";
import { toInventoryItemResponse } from "../mappers/inventory-item-response.mapper";
import { InventoryItemResponse } from "../types/application.types";

export class SearchInventoryItemsUseCase {
    constructor(
        private readonly repository: InventoryItemRepository
    ) { };

    public async execute(): Promise<InventoryItemResponse[]> {
        const items = await this.repository.search();
        const now = new Date();

        return items.map((item) => toInventoryItemResponse(item, now));
    };
};