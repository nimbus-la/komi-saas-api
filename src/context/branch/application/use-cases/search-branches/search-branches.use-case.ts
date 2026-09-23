import { Paginated, Pagination } from "@/interfaces";

import { BranchRepository, BranchResponse, SearchBranchesFilters } from "../../../domain";

export class SearchBranchesUseCase {

    constructor(
        private readonly repository: BranchRepository,
    ) {}

    public async execute(
        filters: SearchBranchesFilters,
        pagination: Pagination,
    ): Promise<Paginated<BranchResponse>> {
        return await this.repository.search(filters, pagination);
    }
}
