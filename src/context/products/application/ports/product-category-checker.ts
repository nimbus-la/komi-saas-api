export abstract class ProductCategoryChecker {
  abstract existsForTenant(
    tenantId: string,
    productCategoryId: string,
  ): Promise<boolean>;
}