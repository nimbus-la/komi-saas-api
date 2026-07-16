import { BranchRepository } from "../../../domain";

export class SearchBranchesByTenantUseCase {

    constructor(
        private readonly repository: BranchRepository,
    ) {}

    public async execute(tenantId: string) {
        return await this.repository.searchByTenantId(tenantId);
    }
}