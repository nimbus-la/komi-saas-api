import { TenantDescription, TenantId, TenantName, TenantNameAlreadyExistsException, TenantNit, TenantNitAlreadyExistsException, TenantRepository, TenantSlug, TenantSlugAlreadyExistsException } from "../../domain";

export class UpdateTenantUseCase{
    constructor(
        private readonly repository: TenantRepository
    ){}

    public async execute(id: string, params: {
            name: string,
            description: string,
            slug: string,
            nit: string
        }
    ): Promise<void> {
    
        const tenant = await this.repository.searchAggregateById(
            TenantId.create(id)
        );

        if (!tenant) {
            throw new Error('Tenant no encontrado')
        }

        const name = TenantName.create(params.name);

        if (await this.repository.existsByName(name)) {
            throw new TenantNameAlreadyExistsException(name.value);
        }

        const slug = TenantSlug.create(params.slug);

        if (await this.repository.existsBySlug(slug)) {
            throw new TenantSlugAlreadyExistsException(slug.value);
        }

        const nit = TenantNit.create(params.nit);

        if (await this.repository.existsByNit(nit)) {
            throw new TenantNitAlreadyExistsException(nit.value);
        }

        tenant.update({
            name,
            description: TenantDescription.create(params.description),
            slug,
            nit,
        });

        await this.repository.update(tenant);
    };

};