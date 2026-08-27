import {
    TenantNameAlreadyExistsException,
    TenantNitAlreadyExistsException,
    TenantSlugAlreadyExistsException,
} from "@/context/tenants/domain/exceptions/tenant-exceptions";

import {
    CreateTenantApplicationParams,
    TenantAggregate,
    TenantDescription,
    TenantName,
    TenantNit,
    TenantRepository,
    TenantSlug,
} from "../../../domain";

export class CreateTenantUseCase {
    constructor(
        private readonly repository: TenantRepository,
    ) {}

    public async execute(
        params: CreateTenantApplicationParams,
    ): Promise<void> {
        const name = TenantName.create(params.name);
        const slug = TenantSlug.create(params.slug);
        const nit = TenantNit.create(params.nit);

        const tenant = await this.repository.searchAggregateByNit(nit);

        if (tenant) {
            throw new TenantNitAlreadyExistsException(nit.value);
        }

        if (await this.repository.existsByName(name)) {
            throw new TenantNameAlreadyExistsException(name.value);
        }

        if (await this.repository.existsBySlug(slug)) {
            throw new TenantSlugAlreadyExistsException(slug.value);
        }

        const newTenant = TenantAggregate.create({
            //accountId: TenantAccountId.create(params.accountId),
            name,
            description: TenantDescription.create(params.description),
            slug,
            nit,
        });

        await this.repository.save(newTenant);
    }
}