import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: 'tenants' })
export class TenantEntity {

    @PrimaryColumn({ name: 'tenant_id', type: 'uuid' })
    id!: string;

    //@Column({name: 'account_id', type: 'uuid'})
    //accountId!: string;

    @Column({ name: 'tenant_name', type: 'varchar', length: 120 })
    name!: string;

    @Column({ name: 'tenant_description', type: 'varchar', length: 225 })
    description!: string;

    @Column({ name: 'tenant_slug', type: 'varchar', length: 120, unique: true })
    slug!: string;

    @Column({ name: 'tenant_nit', type: 'varchar', length: 20, unique: true })
    nit!: string;

    @Column({ name: "tenant_is_active", type: "boolean", default: true, }) 
    isActive!: boolean; 
    
    @Column({ name: "tenant_is_deleted", type: "boolean", default: false, }) 
    isDeleted!: boolean;

    @Column({ name: 'tenant_created_at', type: 'timestamptz' })
    createdAt!: Date;

    @Column({ name: 'tenant_updated_at', type: 'timestamptz' })
    updatedAt!: Date;

};