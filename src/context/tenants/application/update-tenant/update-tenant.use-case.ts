import { TenantDescription, TenantId, TenantName, TenantNameAlreadyExistsException, TenantNit, TenantNitAlreadyExistsException, TenantRepository, TenantSlug, TenantSlugAlreadyExistsException } from "../../domain";

export class UpdateTenantUseCase{
    constructor(
        private readonly repository: TenantRepository
    ){}

    public async execute(id: string,
        params: {
            name?: string | undefined;
            description?: string | undefined;
            slug?: string | undefined;
            nit?: string | undefined;
        }
    ): Promise<void> {
    
        const tenant = await this.repository.searchAggregateById(
            TenantId.create(id)
        );

        if (!tenant) {
            throw new Error('Tenant no encontrado')
        }

        let name: TenantName | undefined;
        let description: TenantDescription | undefined;
        let slug: TenantSlug | undefined;
        let nit: TenantNit | undefined;

        if (params.name !== undefined) {
            name = TenantName.create(params.name);

            if (await this.repository.existsByName(name)) {
                throw new TenantNameAlreadyExistsException(name.value);
            }
        }

        if (params.description !== undefined) {
            description = TenantDescription.create(params.description);
        }

        if (params.slug !== undefined) {
            slug = TenantSlug.create(params.slug);

            if (await this.repository.existsBySlug(slug)) {
                throw new TenantSlugAlreadyExistsException(slug.value);
            }
        }

        if (params.nit !== undefined) {
            nit = TenantNit.create(params.nit);

            if (await this.repository.existsByNit(nit)) {
                throw new TenantNitAlreadyExistsException(nit.value);
            }
        }

        const updateData: {
            name?: TenantName;
            description?: TenantDescription;
            slug?: TenantSlug;
            nit?: TenantNit;
        } = {};

        if (name) {
            updateData.name = name;
        }

        if (description) {
            updateData.description = description;
        }

        if (slug) {
            updateData.slug = slug;
        }

        if (nit) {
            updateData.nit = nit;
        }

        tenant.update(updateData);

        await this.repository.update(tenant);
    };

};