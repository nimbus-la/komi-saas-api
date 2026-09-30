import { Injectable } from "@nestjs/common";

import { BranchId, BranchRepository } from "@/context/branch/domain";
import { BranchChecker } from "../../../application/ports/branch-checker";

@Injectable()
export class BranchCheckerAdapter implements BranchChecker {
    constructor(
        private readonly branches: BranchRepository,
    ) { };

    public async existsInTenant(branchId: string, tenantId: string): Promise<boolean> {
        return this.branches.existsInTenant(BranchId.create(branchId), tenantId);
    };
};
