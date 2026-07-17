import { AggregateRoot } from "@/shared";
import { BranchAddress, BranchCity, BranchDepartment, BranchId, BranchName, BranchPhone} from "./value-object";
import { BranchCreatedEvent } from "./index";
import { BranchPrimitives } from "./types";



export class BranchAggregate  extends AggregateRoot<BranchId>{

    private readonly tenantId: string;
    private name: BranchName;
    private address: BranchAddress;
    private phone: BranchPhone;
    private city: BranchCity;
    private department: BranchDepartment;
    private isActive: boolean;
    private createdAt: Date;
    private updatedAt: Date;

    private constructor(
        id: BranchId,
        tenantId: string,
        name: BranchName,
        address: BranchAddress,
        phone: BranchPhone,
        city: BranchCity,
        department: BranchDepartment,
        isActive: boolean,
        createdAt: Date,
        updatedAt: Date,
    ) {
        super(id);

        this.tenantId = tenantId;
        this.name = name;
        this.address = address;
        this.phone = phone;
        this.city = city;
        this.department = department;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    };

    private touch(): void {
        this.updatedAt = new Date();
    }

    public static create(params: {
        tenantId: string;
        name: BranchName;
        address: BranchAddress;
        phone: BranchPhone;
        city: BranchCity;
        department: BranchDepartment;
        createdAt?: Date;
    }): BranchAggregate {
        const now = new Date();

        const branch = new BranchAggregate(
            BranchId.generate(),
            params.tenantId,
            params.name,
            params.address,
            params.phone,
            params.city,
            params.department,
            true,
            now,
            now
        );

        branch.registerEvent(
            new BranchCreatedEvent({
                branchId: branch.id.value,
                tenantId: branch.tenantId,
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
            tenantId: this.tenantId,
            name: this.name.value,
            address: this.address.value,
            phone: this.phone.value,
            city: this.city.value,
            department: this.department.value,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }

    public static fromPrimitives(primitives: BranchPrimitives): BranchAggregate {
        return new BranchAggregate(
            BranchId.create(primitives.id),
            primitives.tenantId,
            BranchName.create(primitives.name),
            BranchAddress.create(primitives.address),
            BranchPhone.create(primitives.phone),
            BranchCity.create(primitives.city),
            BranchDepartment.create(primitives.department),
            primitives.isActive,
            primitives.createdAt,
            primitives.updatedAt,
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
    
        this.touch();
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