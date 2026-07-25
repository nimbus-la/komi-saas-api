import { InventoryItemRepository } from "../../../domain";
import { InventoryItemResponse } from "../../dtos/inventory-item.response";
import { toInventoryItemResponse } from "../../mappers/inventory-item-response.mapper";


export class SearchInventoryItemsUseCase {
    constructor(
        private readonly repository: InventoryItemRepository
    ) { };

    public async execute(tenantId: string, branchId?: string): Promise<InventoryItemResponse[]> {
        const items = await this.repository.search(tenantId, branchId);
        const now = new Date();

        return items.map((item) =>
            toInventoryItemResponse(item, {
                date: now,
                ...(branchId !== undefined ? { branchId } : {}),
            }),
        );
    };
};