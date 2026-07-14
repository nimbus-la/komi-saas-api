import { Paginated, Pagination } from "@/interfaces";
import { InventoryBatchView } from "../dtos/inventory-item.response";

export abstract class InventoryBatchReadRepository {
    abstract findByItem(itemId: string, pagination: Pagination, branchId?: string): Promise<Paginated<InventoryBatchView>>;
};