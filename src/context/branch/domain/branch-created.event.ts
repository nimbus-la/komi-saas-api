import { DomainEvent } from "@/shared";
import { BranchCreatedProps } from "./types";

export class BranchCreatedEvent extends DomainEvent {
    public readonly branchId: string;
    public readonly tenantId: string;
    public readonly name: string;
    public readonly address: string;
    public readonly phone: string;
    public readonly city: string;
    public readonly department: string;
    public readonly isActive: boolean;

    constructor(props: BranchCreatedProps) {
        super();

        this.branchId = props.branchId;
        this.tenantId = props.tenantId;
        this.name = props.name;
        this.address = props.address;
        this.phone = props.phone;
        this.city = props.city;
        this.department = props.department;
        this.isActive = props.isActive;
    }
}