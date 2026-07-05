import { InventoryBatchReadRepository } from "../ports/inventory-batch-read.repository";
import { InventoryBatchView, Paginated, Pagination } from "../types/application.types";

export class SearchItemBatchesUseCase {
    constructor(
        private readonly reader: InventoryBatchReadRepository
    ) { };

    public execute(itemId: string, pagination: Pagination): Promise<Paginated<InventoryBatchView>> {
        return this.reader.findByItem(itemId, pagination);
    };
};