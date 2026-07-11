import { InventoryItemId, InventoryItemNotFoundException, InventoryItemRepository } from "../../../domain";
import { toInventoryItemResponse } from "../../mappers/inventory-item-response.mapper";
import { InventoryItemResponse } from "../../dtos/inventory-item.response";


export class FindInventoryItemUseCase {
    constructor(
        private readonly repository: InventoryItemRepository
    ) { };

    public async execute(itemId: string, branchId?: string): Promise<InventoryItemResponse> {
        const item = await this.repository.findById(InventoryItemId.create(itemId), branchId);

        if (item === null) {
            throw new InventoryItemNotFoundException(itemId);
        };

        return toInventoryItemResponse(item, branchId !== undefined ? { branchId } : {});
    };
};