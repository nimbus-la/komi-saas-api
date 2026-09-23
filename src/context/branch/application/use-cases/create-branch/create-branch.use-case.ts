import { BranchAddress, BranchAggregate, BranchCity, BranchDepartment, BranchName, BranchNameAlreadyExistsException, BranchPhone, BranchRepository, BranchTenantNotFoundException, CreateBranchApplicationParams } from "../../../domain";
import { TenantChecker } from "../../ports/tenant-checker";

export class CreateBranchUseCase {
    constructor(
        private readonly repository: BranchRepository,
        private readonly tenantChecker: TenantChecker,
    ) {}

    public async execute(params: CreateBranchApplicationParams): Promise<void> {
        if (!(await this.tenantChecker.exists(params.tenantId))) {
            throw new BranchTenantNotFoundException(params.tenantId);
        }

        const name = BranchName.create(params.name);

        if (await this.repository.existsByName(name, params.tenantId)) {
            throw new BranchNameAlreadyExistsException(name.value);
        }

        const newBranch = BranchAggregate.create({
            tenantId: params.tenantId,
            name,
            address: BranchAddress.create(params.address),
            phone: BranchPhone.create(params.phone),
            city: BranchCity.create(params.city),
            department: BranchDepartment.create(params.department),
        });

        await this.repository.save(newBranch);
    }
}