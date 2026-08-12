import { Injectable } from "@nestjs/common";

import { TenantId, TenantRepository } from "@/context/tenants/domain";
import { TenantChecker } from "../../../application/ports/tenant-checker";

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
