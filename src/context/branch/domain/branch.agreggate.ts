import { AggregateRoot } from "@/shared";
import { BranchAddress, BranchCity, BranchDepartment, BranchId, BranchName, BranchPhone} from "./value-object";
import { BranchCreatedEvent } from "./branch-created.event";
import { BranchPrimitives } from "./types";
import { TenantId } from "@/context/tenants/domain";



export class BranchAggregate  extends AggregateRoot<BranchId>{

    private readonly tenantId: TenantId;
    private name: BranchName;
    private address: BranchAddress;
    private phone: BranchPhone;
    private city: BranchCity;
    private department: BranchDepartment;
    private isActive: boolean;

    private constructor(
        id: BranchId,
        tenantId: TenantId,
        name: BranchName,
        address: BranchAddress,
        phone: BranchPhone,
        city: BranchCity,
        department: BranchDepartment,
        isActive: boolean
    ) {
        super(id);

        this.tenantId = tenantId;
        this.name = name;
        this.address = address;
        this.phone = phone;
        this.city = city;
        this.department = department;
        this.isActive = isActive;
    };

    public static create(params: {
        tenantId: TenantId;
        name: BranchName;
        address: BranchAddress;
        phone: BranchPhone;
        city: BranchCity;
        department: BranchDepartment;
    }): BranchAggregate {
        const branch = new BranchAggregate(
            BranchId.generate(),
            params.tenantId,
            params.name,
            params.address,
            params.phone,
            params.city,
            params.department,
            true
        );

        branch.registerEvent(
            new BranchCreatedEvent({
                branchId: branch.id.value,
                tenantId: branch.tenantId.value,
                name: branch.name.value,
                address: branch.address.value,
                phone: branch.phone.value,
                city: branch.city.value,
                department: branch.department.value,
                isActive: branch.isActive,
            })
        );

        return branch;
    };

    public toPrimitives(): BranchPrimitives {
        return {
            id: this.id.value,
            tenantId: this.tenantId.value,
            name: this.name.value,
            address: this.address.value,
            phone: this.phone.value,
            city: this.city.value,
            department: this.department.value,
            isActive: this.isActive,
        };
    }

    public static fromPrimitives(primitives: BranchPrimitives): BranchAggregate {
        return new BranchAggregate(
            BranchId.create(primitives.id),
            TenantId.create(primitives.tenantId),
            BranchName.create(primitives.name),
            BranchAddress.create(primitives.address),
            BranchPhone.create(primitives.phone),
            BranchCity.create(primitives.city),
            BranchDepartment.create(primitives.department),
            primitives.isActive
        );
    };

    public update(params: {
        name?: BranchName;
        address?: BranchAddress;
        phone?: BranchPhone;
        city?: BranchCity;
        department?: BranchDepartment;
    }): void {

        if (params.name) {
            this.name = params.name;
        }

        if (params.address) {
            this.address = params.address;
        }

        if (params.phone) {
            this.phone = params.phone;
        }

        if (params.city) {
            this.city = params.city;
        }

        if (params.department) {
            this.department = params.department;
        }
    }

    public deactivate(): void {
        if (!this.isActive) {
            throw new Error("La sucursal ya se encuentra desactivada.");
        }

        this.isActive = false;
    }

    public activate(): void {
        if (this.isActive) {
            throw new Error("La sucursal ya se encuentra activa.");
        }

        this.isActive = true;
    }

    public get active(): boolean {
        return this.isActive;
    }
};