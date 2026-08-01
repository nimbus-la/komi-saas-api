export abstract class InventoryItemChecker {
  abstract existsForTenant(
    tenantId: string,
    inventoryItemId: string,
  ): Promise<boolean>;
}