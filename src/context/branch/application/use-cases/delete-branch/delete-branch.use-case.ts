import { BranchId, BranchRepository } from "../../../domain";

export class DeleteBranchUseCase {
    constructor(
        private readonly repository: BranchRepository
    ) {}

    public async execute(id: string): Promise<void> {
        const branch = await this.repository.searchAggregateById(
            BranchId.create(id)
        );

        if (!branch) {
            throw new Error (" Sucursal no encontrada. ")
        };

        branch.deactivate();

        await this.repository.update(branch);
    };
};