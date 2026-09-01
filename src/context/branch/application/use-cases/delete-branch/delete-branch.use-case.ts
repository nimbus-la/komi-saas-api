import { BranchId, BranchNotFoundException, BranchRepository } from "../../../domain";

export class DeleteBranchUseCase {
    constructor(
        private readonly repository: BranchRepository
    ) {}

    public async execute(id: string, tenantId: string): Promise<void> {
        // Acotada por negocio: si la sucursal es de otro, no aparece y sale el
        // mismo "no existe" que si nunca hubiera existido.
        const branch = await this.repository.searchAggregateById(
            BranchId.create(id),
            tenantId
        );

        if (!branch) {
            throw new BranchNotFoundException(id)
        };

        branch.deactivate();

        await this.repository.update(branch);
    };
};