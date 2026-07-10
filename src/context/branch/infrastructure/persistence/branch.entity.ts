import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { TenantEntity } from "@/context/tenants/infrastructure/persistence/tenant.entity";

@Entity({ name: 'branches' })
export class BranchEntity {

    @PrimaryColumn({ name: 'branch_id', type: 'uuid' })
    id!: string;

    @Column({ name: "tenant_id", type: "uuid" })
    tenantId!: string;

    @ManyToOne(() => TenantEntity, (tenant) => tenant.branches, {
        nullable: false,
        onDelete: "RESTRICT",
    })
    @JoinColumn({ name: "tenant_id" })
        tenant?: TenantEntity;

    @Column({ name: 'branch_name', type: 'varchar', length: 120 })
    name!: string;

    @Column({ name: 'branch_address', type: 'varchar', length: 225 })
    address!: string;

    @Column({ name: 'branch_phone', type: 'varchar', length: 20 })
    phone!: string;

    @Column({ name: 'branch_city', type: 'varchar', length: 120 })
    city!: string;

    @Column({ name: 'branch_department', type: 'varchar', length: 120 })
    department!: string;

    @Column({ name: 'branch_is_active', type: 'boolean', default: true })
    isActive!: boolean;

    @CreateDateColumn({ name: 'branch_created_at', type: 'timestamptz' })
    createdAt!: Date;

    @CreateDateColumn({ name: 'branch_updated_at', type: 'timestamptz' })
    updatedAt!: Date;
}