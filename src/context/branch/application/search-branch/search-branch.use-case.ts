import { BranchId, BranchRepository } from "../../domain";

export class SearchBranchUseCase {
    constructor(
        private readonly repository: BranchRepository
    ) {}

    public async execute(id: string) {
        return await this.repository.searchById(
            BranchId.create(id)
        )
    }
}