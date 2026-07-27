import { Paginated, Pagination } from "@/interfaces";
import { InventoryItemRepository } from "../../../domain";
import { InventoryItemResponse } from "../../dtos/inventory-item.response";
import { toInventoryItemResponse } from "../../mappers/inventory-item-response.mapper";


export class SearchInventoryItemsUseCase {
    constructor(
        private readonly repository: InventoryItemRepository
    ) { };

    public async execute(tenantId: string, pagination: Pagination, branchId?: string): Promise<Paginated<InventoryItemResponse>> {
        const { data, pageNumber, pageSize, total } = await this.repository.search(tenantId, pagination, branchId);
        const now = new Date();

        return {
            data: data.map((item) =>
                toInventoryItemResponse(item, {
                    date: now,
                    ...(branchId !== undefined ? { branchId } : {}),
                }),
            ),
            pageNumber,
            pageSize,
            total,
        };
    };
};