import { BranchRepository } from "../../domain";

export class SearchAllBranchUseCase {
    constructor(
        private readonly repository: BranchRepository,
    ) {}

    public async execute() {
        return await this.repository.searchAll();
    }
}