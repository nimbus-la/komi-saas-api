import { Paginated, Pagination } from "@/interfaces";

import { InventoryItem } from "./inventory-item.aggregate";
import { InventoryItemId } from "./value-objects/inventory-item-id.value-object";
import { InventoryItemName } from "./value-objects/inventory-item-name.value-object";

export abstract class InventoryItemRepository {
    abstract save(item: InventoryItem): Promise<void>;
    abstract findById(id: InventoryItemId, tenantId: string, branchId?: string): Promise<InventoryItem | null>;
    /** Varios items del negocio en una sola carga; los ids que no existan o sean de otro negocio no vienen. */
    abstract findByIds(ids: InventoryItemId[], tenantId: string, branchId?: string): Promise<InventoryItem[]>;
    abstract search(tenantId: string, pagination: Pagination, branchId?: string): Promise<Paginated<InventoryItem>>;
    abstract existsByName(name: InventoryItemName, tenantId: string): Promise<boolean>;
    abstract nextSkuSequence(): Promise<number>;
};