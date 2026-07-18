import { Injectable } from "@nestjs/common";

import { TenantChecker } from "../../../application";
import { TenantId, TenantRepository } from "@/context/tenants/domain";


@Injectable()
export class TenantCheckerAdapter implements TenantChecker {
    constructor(
        private readonly tenants: TenantRepository,
    ) { };

    public async exists(tenantId: string): Promise<boolean> {
        const tenant = await this.tenants.searchById(TenantId.create(tenantId));
        return tenant !== null;
    };
};