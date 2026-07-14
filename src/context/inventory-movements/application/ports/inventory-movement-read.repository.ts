import { Paginated, Pagination } from "@/interfaces";
import { InventoryMovementView, MovementSearchFilters } from "../dtos/inventory-movement.application";

export abstract class InventoryMovementReadRepository {
    abstract search(filters: MovementSearchFilters, pagination: Pagination): Promise<Paginated<InventoryMovementView>>;
};