import { Paginated, Pagination } from "@/interfaces";
import { InventoryBatchReadRepository } from "../../ports/inventory-batch-read.repository";
import { InventoryBatchView } from "../../dtos/inventory-item.response";


export class SearchItemBatchesUseCase {
    constructor(
        private readonly reader: InventoryBatchReadRepository
    ) { };

    public execute(itemId: string, pagination: Pagination, branchId?: string): Promise<Paginated<InventoryBatchView>> {
        return this.reader.findByItem(itemId, pagination, branchId);
    };
};