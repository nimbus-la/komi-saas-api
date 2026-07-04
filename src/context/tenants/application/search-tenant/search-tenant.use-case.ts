import { TenantId, TenantRepository } from "../../domain";

export class SearchTenantUseCase {
    constructor(
        private readonly repository: TenantRepository
    ) {}

    public async execute(id: string) {
        return await this.repository.searchById(
            TenantId.create(id)
        );
    };

};