export abstract class BranchChecker {
  abstract existsInTenant(branchId: string, tenantId: string): Promise<boolean>;
}
