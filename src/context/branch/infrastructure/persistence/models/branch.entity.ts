import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: 'branches' })
export class BranchEntity {

    @PrimaryColumn({ name: 'branch_id', type: 'uuid' })
    id!: string;

    @Column({ name: "tenant_id", type: "uuid" })
    tenantId!: string;

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

    @Column({ name: 'branch_created_at', type: 'timestamptz' })
    createdAt!: Date;

    @Column({ name: 'branch_updated_at', type: 'timestamptz' })
    updatedAt!: Date;
}