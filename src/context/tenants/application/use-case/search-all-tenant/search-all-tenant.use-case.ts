import { TenantRepository } from "../../../domain";

export class SearchAllTenantsUseCase {
    constructor(
        private readonly repository: TenantRepository,
    ) {}

    public async execute() {
        return await this.repository.searchAll();
    }
}