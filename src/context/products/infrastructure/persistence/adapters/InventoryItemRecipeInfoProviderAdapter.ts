import { Injectable } from "@nestjs/common";

import { InventoryItem, InventoryItemRepository } from "@/context/inventory";
import { InventoryItemId } from "@/context/inventory/domain/value-objects/inventory-item-id.value-object";

import {
    InventoryItemRecipeInfoProvider,
    InventoryItemRecipeInfo,
} from "@/context/products/application/ports/inventory-item-recipe-info.provider";

@Injectable()
export class InventoryItemRecipeInfoProviderAdapter
    implements InventoryItemRecipeInfoProvider {

    constructor(
        private readonly inventory: InventoryItemRepository,
    ) { }

    async getMany(
        tenantId: string,
        inventoryItemIds: string[],
    ): Promise<Map<string, InventoryItemRecipeInfo>> {

        const items = await this.inventory.findByIds(
            inventoryItemIds.map((id) => InventoryItemId.create(id)),
            tenantId,
        );

        return new Map(
            items.map((item) => {
                const info = this.toRecipeInfo(item);
                return [info.inventoryItemId, info];
            }),
        );
    }

    private toRecipeInfo(item: InventoryItem): InventoryItemRecipeInfo {
        const primitive = item.toPrimitives();

        const currentStock = primitive.batches.reduce(
            (total, batch) =>
                total + Number(batch.quantityRemaining),
            0,
        );

        const totalCost = primitive.batches.reduce(
            (total, batch) =>
                total +
                (
                    Number(batch.quantityRemaining) *
                    Number(batch.unitCostAmount)
                ),
            0,
        );

        const unitCostAmount =
            currentStock === 0
                ? null
                : (totalCost / currentStock).toString();

        return {
            inventoryItemId: primitive.id,
            name: primitive.name,
            unitOfMeasure: primitive.unitOfMeasure,
            unitCostAmount,
            currentStock: currentStock.toString(),
        };
    }
}