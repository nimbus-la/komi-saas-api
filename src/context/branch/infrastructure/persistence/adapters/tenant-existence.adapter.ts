import { Injectable } from "@nestjs/common";
import { TenantId, TenantRepository } from "@/context/tenants/domain";
import { TenantExistencePort } from "@/context/branch/application";


@Injectable()
export class TenantExistenceAdapter implements TenantExistencePort {

    constructor(
        private readonly tenantRepository: TenantRepository,
    ) {}

    public async exists(tenantId: string): Promise<boolean> {

        const tenant = await this.tenantRepository.searchAggregateById(
            TenantId.create(tenantId),
        );

        return tenant !== null;
    }
}