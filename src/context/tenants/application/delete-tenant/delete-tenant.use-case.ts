import { TenantId, TenantRepository } from "../../domain";

export class DeleteTenantUseCases {
    constructor(
        private readonly repository: TenantRepository
    ) {}

    public async execute(id: string): Promise<void> {
        const tenant = await this.repository.searchAggregateById(
            TenantId.create(id)
        );
         if(!tenant){
            throw new Error("Tenant no encontrado")
         };

        tenant.desactivate();

        await this.repository.update(tenant);
    };
};