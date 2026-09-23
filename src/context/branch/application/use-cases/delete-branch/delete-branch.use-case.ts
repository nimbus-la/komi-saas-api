import { BranchId, BranchNotFoundException, BranchRepository } from "../../../domain";

export class DeleteBranchUseCase {
    constructor(
        private readonly repository: BranchRepository,
    ) {}

    public async execute(id: string, tenantId: string): Promise<void> {
        // Acotada por negocio y sin las eliminadas: una sucursal de otro negocio
        // o ya eliminada responde el mismo "no existe".
        const branch = await this.repository.searchAggregateById(
            BranchId.create(id),
            tenantId,
        );

        if (!branch) {
            throw new BranchNotFoundException(id);
        }

        branch.delete();

        await this.repository.update(branch);
    }
}
