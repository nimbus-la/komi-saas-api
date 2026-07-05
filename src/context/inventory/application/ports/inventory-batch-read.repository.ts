import { InventoryBatchView, Paginated, Pagination } from "../types/application.types";

export abstract class InventoryBatchReadRepository {
    abstract findByItem(itemId: string, pagination: Pagination): Promise<Paginated<InventoryBatchView>>;
};