import { CreateTenantApplicationParams, TenantAccountId, TenantAggregate, TenantDescription, TenantName, TenantNameAlreadyExistsException, TenantNit, TenantNitAlreadyExistsException, TenantRepository, TenantSlug, TenantSlugAlreadyExistsException } from "../../domain";


export class CreateTenantUseCase {
    constructor(private readonly repository: TenantRepository) {};

    public async execute(params: CreateTenantApplicationParams): Promise<void> {
        const name = TenantName.create(params.name);

        if (await this.repository.existsByName(name)) {
            throw new TenantNameAlreadyExistsException(name.value);
        };

        const slug = TenantSlug.create(params.slug);

        if (await this.repository.existsBySlug(slug)) {
            throw new TenantSlugAlreadyExistsException(slug.value);
        };

        const nit = TenantNit.create(params.nit);

        if (await this.repository.existsByNit(nit)) {
            throw new TenantNitAlreadyExistsException(nit.value);
        };

        const tenant = TenantAggregate.create({
            accountId: TenantAccountId.create(params.accountId),
            name,
            description: TenantDescription.create(params.description),
            slug,
            nit
        });

        await this.repository.save(tenant);
    }
};