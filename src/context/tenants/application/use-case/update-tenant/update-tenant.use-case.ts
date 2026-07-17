import { TenantNameAlreadyExistsException, TenantNitAlreadyExistsException, TenantNotFoundException, TenantSlugAlreadyExistsException } from "@/context/tenants/domain/exceptions/tenant-exceptions";
import { TenantDescription, TenantId, TenantName, TenantNit, TenantRepository, TenantSlug } from "../../../domain";

export interface UpdateTenantParams {
    name?: string;
    description?: string;
    slug?: string;
    nit?: string;
}

export class UpdateTenantUseCase {

    constructor(
        private readonly repository: TenantRepository,
    ) {}

    public async execute(
        id: string,
        params: UpdateTenantParams,
    ): Promise<void> {

        const tenant = await this.repository.searchAggregateById(
            TenantId.create(id),
        );

        if (tenant === null) {
            throw new TenantNotFoundException(id);
        }

        let name: TenantName | undefined;
        let slug: TenantSlug | undefined;
        let nit: TenantNit | undefined;

        if (params.name !== undefined) {
            name = TenantName.create(params.name);

            if (await this.repository.existsByName(name)) {
                throw new TenantNameAlreadyExistsException(params.name);
            }
        }

        if (params.slug !== undefined) {
            slug = TenantSlug.create(params.slug);

            if (await this.repository.existsBySlug(slug)) {
                throw new TenantSlugAlreadyExistsException(params.slug);
            }
        }

        if (params.nit !== undefined) {
            nit = TenantNit.create(params.nit);

            if (await this.repository.existsByNit(nit)) {
                throw new TenantNitAlreadyExistsException(params.nit);
            }
        }

        tenant.update({
            ...(name ? { name } : {}),
            ...(params.description !== undefined
                ? { description: TenantDescription.create(params.description) }
                : {}),
            ...(slug ? { slug } : {}),
            ...(nit ? { nit } : {}),
        });

        await this.repository.update(tenant);
    }
}