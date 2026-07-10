import { BranchAddress, BranchCity, BranchDepartment, BranchId, BranchName, BranchNameAlreadyExistsException, BranchPhone, BranchRepository } from "../../domain";

export class UpdateBranchUseCase {
    constructor(
        private readonly repository: BranchRepository
    ) {}

    public async execute(
        id: string,
        params: {
            name?: string | undefined;
            address?: string | undefined;
            phone?: string | undefined;
            city?: string | undefined;
            department?: string | undefined;
        }
    ): Promise<void> {

        const branch = await this.repository.searchAggregateById(
            BranchId.create(id)
        );

        if (!branch) {
            throw new Error("Sucursal no encontrada");
        }

        let name: BranchName | undefined;
        let address: BranchAddress | undefined;
        let phone: BranchPhone | undefined;
        let city: BranchCity | undefined;
        let department: BranchDepartment | undefined;

        if (params.name !== undefined) {
            name = BranchName.create(params.name);

            if (await this.repository.existsByName(name)) {
                throw new BranchNameAlreadyExistsException(name.value);
            }
        }

        if (params.address !== undefined) {
            address = BranchAddress.create(params.address);
        }

        if (params.phone !== undefined) {
            phone = BranchPhone.create(params.phone);
        }

        if (params.city !== undefined) {
            city = BranchCity.create(params.city);
        }

        if (params.department !== undefined) {
            department = BranchDepartment.create(params.department);
        }

        const updateData: {
            name?: BranchName;
            address?: BranchAddress;
            phone?: BranchPhone;
            city?: BranchCity;
            department?: BranchDepartment;
        } = {};

        if (name) {
            updateData.name = name;
        }

        if (address) {
            updateData.address = address;
        }

        if (phone) {
            updateData.phone = phone;
        }

        if (city) {
            updateData.city = city;
        }

        if (department) {
            updateData.department = department;
        }

        branch.update(updateData);

        await this.repository.update(branch);
    }
}