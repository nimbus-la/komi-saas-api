import { DomainEvent } from "@/shared";
import { TenantCreatedProps } from "../types/tenant-event";

export class TenantCreatedEvent extends DomainEvent {
    public readonly eventName = 'tenant.created';

    public readonly tenantId: string;
    public readonly accountId: string;
    public readonly name: string;
    public readonly description: string;
    public readonly slug: string;
    public readonly nit: string;
    public readonly isActive: boolean;

    constructor(props: TenantCreatedProps) {
        super();

        this.tenantId = props.tenantId;
        this.accountId = props.accountId;
        this.name = props.name;
        this.description = props.description;
        this.slug = props.slug;
        this.nit = props.nit;
        this.isActive = props.isActive;
    }
};