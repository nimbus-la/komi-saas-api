import { TenantId, TenantRepository } from "@/context/tenants/domain";
import { TenantChecker } from "@/context/user/application";
import { Injectable } from "@nestjs/common";

@Injectable()
export class TenantCheckerAdapter implements TenantChecker {
  constructor(
    private readonly tenants: TenantRepository,
  ) {}

  public async exists(tenantId: string): Promise<boolean> {
    const tenant = await this.tenants.searchAggregateById(
      TenantId.create(tenantId),
    );

    return tenant !== null && tenant.toPrimitives().isActive;
  }
}