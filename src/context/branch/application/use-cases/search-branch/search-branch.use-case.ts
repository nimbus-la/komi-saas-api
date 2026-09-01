import { BranchId, BranchRepository } from "../../../domain";

export class SearchBranchUseCase {
    constructor(
        private readonly repository: BranchRepository
    ) {}

    /** El negocio llega del token, no de la petición: una sucursal ajena no existe. */
    public async execute(id: string, tenantId: string) {
        return await this.repository.searchById(
            BranchId.create(id),
            tenantId
        )
    }
}