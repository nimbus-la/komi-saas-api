import { AggregateRoot } from "@/shared";
import { TenantDescription, TenantId, TenantName, TenantNit, TenantSlug} from "./value-object";
import { TenantPrimitives } from "./types";
import { TenantCreatedEvent } from "./events/tenant-created.event";

export class TenantAggregate extends AggregateRoot<TenantId> {
    //private readonly accountId: TenantAccountId;
    private name: TenantName;
    private description: TenantDescription;
    private slug: TenantSlug;
    private nit: TenantNit;
    private isActive: boolean;
    private isDeleted: boolean;
    private createdAt: Date;
    private updatedAt: Date;



    private constructor(
        id: TenantId,
       // accountId: TenantAccountId,
        name: TenantName,
        description: TenantDescription,
        slug: TenantSlug,
        nit: TenantNit,
        isActive: boolean,
        isDeleted: boolean,
        createdAt: Date,
        updatedAt: Date,
    ) {
        super(id);

        //this.accountId = accountId;
        this.name = name;
        this.description = description;
        this.slug = slug;
        this.nit = nit;
        this.isActive = isActive;
        this.isDeleted = isDeleted;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    };

    private touch(): void {
        this.updatedAt = new Date();
    }

    public static create(params: {
       // accountId: TenantAccountId;
        name: TenantName;
        description: TenantDescription;
        slug: TenantSlug;
        nit: TenantNit;
        createdAt?: Date;
    }): TenantAggregate {
        const now = new Date();

        const tenant = new TenantAggregate(
            TenantId.generate(),
          //  params.accountId,
            params.name,
            params.description,
            params.slug,
            params.nit,
            true,
            false,
            now,
            now
        ); 

        tenant.registerEvent(
            new TenantCreatedEvent({
                tenantId: tenant.id.value,
               // accountId: tenant.accountId.value,
                name: tenant.name.value,
                description: tenant.description.value,
                slug: tenant.slug.value,
                nit: tenant.nit.value,
                isActive: tenant.isActive,
            })
        );
        return tenant;
    };

    public toPrimitives(): TenantPrimitives {
        return {
            id: this.id.value,
           // accountId: this.accountId.value,
            name: this.name.value,
            description: this.description.value,
            slug: this.slug.value,
            nit: this.nit.value,
            isActive: this.isActive,
            isDeleted: this.isDeleted,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        }

    };

    public static fromPrimitives(primitives: TenantPrimitives): TenantAggregate {
        return new TenantAggregate(
            TenantId.create(primitives.id),
           // TenantAccountId.create(primitives.accountId),
            TenantName.create(primitives.name),
            TenantDescription.create(primitives.description),
            TenantSlug.create(primitives.slug),
            TenantNit.create(primitives.nit),
            primitives.isActive,
            primitives.isDeleted,
            primitives.createdAt,
            primitives.updatedAt,
        );

    };

    public update(params: {
        name?: TenantName;
        description?: TenantDescription;
        slug?: TenantSlug;
        nit?: TenantNit;
    }): void {
        if (params.name) {
        this.name = params.name;
        }

        if (params.description) {
            this.description = params.description;
        }

        if (params.slug) {
            this.slug = params.slug;
        }

        if (params.nit) {
            this.nit = params.nit;
        }

        this.touch();
    }
    
    public desactivate(): void {
        if (!this.isActive) {
            throw new Error("El tenant se encuentra desactivado.");
        }

    this.isActive = false;
    }

    public activate(): void {
        if (this.isActive) {
            throw new Error("El tenant se encuentra activado.");
        }

        this.isActive = true;
    }

    public delete(): void { 
        if (this.isDeleted) { 
            throw new Error("El tenant ya se encuentra eliminado."); 
        } 
        this.isDeleted = true; this.isActive = false; this.touch();
    }

    public get active(): boolean {
        return this.isActive;
    }

    public get deleted(): boolean { 
        return this.isDeleted; 
    }
};