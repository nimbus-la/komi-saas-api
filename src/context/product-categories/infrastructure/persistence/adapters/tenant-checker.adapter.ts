import { Injectable } from "@nestjs/common";

import { TenantId, TenantRepository } from "@/context/tenants/domain";
import { TenantChecker } from "@/context/products/application/ports/tenant-checker";

@Injectable()
export class TenantCheckerAdapter implements TenantChecker {
    constructor(
        private readonly tenants: TenantRepository,
    ) { }

    public async exists(tenantId: string): Promise<boolean> {
        const tenant = await this.tenants.searchById(
            TenantId.create(tenantId),
        );

        return tenant !== null;
    }
}