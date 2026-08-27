import { TenantId, TenantRepository } from "@/context/tenants/domain";
import { TenantNotFoundException } from "@/context/tenants/domain/exceptions/tenant-exceptions";

export class ToggleTenantStatusUseCase {
    constructor(
        private readonly repository: TenantRepository,
    ) {}

    public async execute(id: string): Promise<void> {
        const tenant = await this.repository.searchAggregateById(
            TenantId.create(id),
        );

        if (tenant === null) {
            throw new TenantNotFoundException(id);
        }

        if (tenant.active) {
            tenant.desactivate();
        } else {
            tenant.activate();
        }

        await this.repository.update(tenant);
    }
}