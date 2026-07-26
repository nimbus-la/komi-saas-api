import { Injectable } from "@nestjs/common";

import { InventoryItemChecker } from "@/context/products/application/ports/inventory-item-checker";
import { InventoryItemRepository } from "@/context/inventory";
import { InventoryItemId } from "@/context/inventory/domain/value-objects/inventory-item-id.value-object";

@Injectable()
export class InventoryItemCheckerAdapter
    implements InventoryItemChecker {

    constructor(
        private readonly inventory: InventoryItemRepository,
    ) { }

    async existsForTenant(
        tenantId: string,
        inventoryItemId: string,
    ): Promise<boolean> {

        const item = await this.inventory.findById(
            InventoryItemId.create(inventoryItemId),
            tenantId,
        );

        return item !== null;
    }
}