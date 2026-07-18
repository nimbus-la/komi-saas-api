import { Injectable } from "@nestjs/common";

import { BranchId, BranchRepository } from "@/context/branch/domain";
import { BranchChecker } from "../../../application";

@Injectable()
export class BranchCheckerAdapter implements BranchChecker {
    constructor(
        private readonly branches: BranchRepository,
    ) { };

    public async exists(branchId: string): Promise<boolean> {
        const branch = await this.branches.searchById(BranchId.create(branchId));
        return branch !== null;
    };
};