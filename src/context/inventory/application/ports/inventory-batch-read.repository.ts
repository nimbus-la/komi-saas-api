import { Paginated, Pagination } from "@/interfaces";
import { InventoryBatchView } from "../dtos/inventory-item.response";

export abstract class InventoryBatchReadRepository {
    abstract findByItem(itemId: string, tenantId: string, pagination: Pagination, branchId?: string): Promise<Paginated<InventoryBatchView>>;
};