import { Paginated, Pagination } from "@/interfaces";

import { InventoryMovementView, MovementSearchFilters } from "../../dtos/inventory-movement.application";
import { InventoryMovementReadRepository } from "../../ports/inventory-movement-read.repository";


export class SearchMovementsUseCase {
    constructor(
        private readonly reader: InventoryMovementReadRepository
    ) { };

    public execute(filters: MovementSearchFilters, pagination: Pagination): Promise<Paginated<InventoryMovementView>> {
        return this.reader.search(filters, pagination);
    };
};