import { InventoryItem } from "./inventory-item.aggregate";
import { InventoryItemId } from "./value-objects/inventory-item-id.value-object";
import { InventoryItemName } from "./value-objects/inventory-item-name.value-object";

export abstract class InventoryItemRepository {
    abstract save(item: InventoryItem): Promise<void>;
    abstract findById(id: InventoryItemId, branchId?: string): Promise<InventoryItem | null>;
    abstract search(branchId?: string): Promise<InventoryItem[]>;
    abstract existsByName(name: InventoryItemName): Promise<boolean>;
    abstract nextSkuSequence(): Promise<number>;
};