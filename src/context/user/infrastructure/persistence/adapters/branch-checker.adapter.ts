import { BranchId, BranchRepository } from "@/context/branch/domain";
import { BranchChecker } from "@/context/user/application";
import { Injectable } from "@nestjs/common";

@Injectable()
export class BranchCheckerAdapter implements BranchChecker {
  constructor(
    private readonly branches: BranchRepository,
  ) {}

  public async existsInTenant(
    branchId: string,
    tenantId: string,
  ): Promise<boolean> {
    const branch = await this.branches.searchById(
      BranchId.create(branchId),
    );

    return branch !== null && branch.tenantId === tenantId;
  }
}