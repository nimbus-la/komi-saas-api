import { BranchAddress, BranchCity, BranchDepartment, BranchId, BranchName, BranchNameAlreadyExistsException, BranchNotFoundException, BranchPhone, BranchRepository } from "../../../domain";

export interface UpdateBranchParams {
    name?: string;
    address?: string;
    phone?: string;
    city?: string;
    department?: string;
    isActive?: boolean;
}

export class UpdateBranchUseCase {
    constructor(
        private readonly repository: BranchRepository,
    ) { }

    public async execute(
        id: string,
        tenantId: string,
        params: UpdateBranchParams,
    ): Promise<void> {

        // Acotada por negocio: si la sucursal es de otro, no aparece y sale el
        // mismo "no existe" que si nunca hubiera existido.
        const branch = await this.repository.searchAggregateById(
            BranchId.create(id),
            tenantId
        );

        if (branch === null) {
            throw new BranchNotFoundException(id);
        }

        let name: BranchName | undefined;

        if (params.name !== undefined) {
            name = BranchName.create(params.name);

            // Si solo cambian mayúsculas, la consulta encontraría a esta misma
            // sucursal; no hay otra con ese nombre, así que no se consulta.
            if (!branch.hasName(name) && await this.repository.existsByName(name, tenantId)) {
                throw new BranchNameAlreadyExistsException(params.name);
            }
        }

        branch.update({
            ...(name ? { name } : {}),
            ...(params.address !== undefined
                ? { address: BranchAddress.create(params.address) }
                : {}),
            ...(params.phone !== undefined
                ? { phone: BranchPhone.create(params.phone) }
                : {}),
            ...(params.city !== undefined
                ? { city: BranchCity.create(params.city) }
                : {}),
            ...(params.department !== undefined
                ? { department: BranchDepartment.create(params.department) }
                : {}),
            ...(params.isActive !== undefined
                ? { isActive: params.isActive }
                : {}),
        });

        await this.repository.update(branch);
    }
}