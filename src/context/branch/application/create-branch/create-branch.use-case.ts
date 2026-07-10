import { TenantId, TenantRepository } from "@/context/tenants/domain";
import { BranchAddress, BranchAggregate, BranchCity, BranchDepartment, BranchName, BranchNameAlreadyExistsException, BranchPhone, BranchRepository, CreateBranchApplicationParams } from "../../domain";
import { TenantNotFoundException } from "@/context/inventory/domain/exceptions/inventory-item.exceptions";

export class CreateBranchUseCase {
    constructor(
        private readonly repository: BranchRepository,
        private readonly tenantRepository: TenantRepository,
    ) {}

    public async execute(params: CreateBranchApplicationParams): Promise<void> {

        const tenantId = TenantId.create(params.tenantId);

        const tenant = await this.tenantRepository.searchAggregateById(tenantId);

        if (!tenant) {
            throw new TenantNotFoundException(params.tenantId);
        }

        const name = BranchName.create(params.name);

        if (await this.repository.existsByName(name)) {
            throw new BranchNameAlreadyExistsException(name.value);
        }

        const newBranch = BranchAggregate.create({
            tenantId,
            name,
            address: BranchAddress.create(params.address),
            phone: BranchPhone.create(params.phone),
            city: BranchCity.create(params.city),
            department: BranchDepartment.create(params.department),
        });

        await this.repository.save(newBranch);
    }
}