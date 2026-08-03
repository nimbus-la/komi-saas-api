import { UserRolScopeEnum, UserSexEnum } from "@/context/user/domain";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "users" })
export class UserEntity {
  @PrimaryColumn({ name: "user_id", type: "uuid" })
  id!: string;

  @Column({ name: "tenant_id" })
  tenantId!: string;

  @Column({ name: "branch_id", type: "uuid", nullable: true })
  branchId!: string | null;

  @Column({ name: "rol_id", type: "uuid" })
  rolId!: string;

  @Column({
    name: "rol_scope",
    type: "varchar",
    length: 20,
  })
  rolScope!: UserRolScopeEnum;
  
  @Column({ name: "user_name", type: "varchar", length: 50 })
  userName!: string;

  @Column({ name: "user_email", type: "varchar", length: 120 })
  email!: string;

  @Column({ name: "user_password", type: "varchar", length: 255 })
  password!: string;

  @Column({ name: "user_full_name", type: "varchar", length: 120 })
  fullName!: string;

  @Column({ name: "user_last_name", type: "varchar", length: 120 })
  lastName!: string;

  @Column({ name: "user_birth_date", type: "date" })
  age!: Date;

  @Column({ name: "user_sex", type: "enum", enum: UserSexEnum })
  sex!: UserSexEnum;

  @Column({ name: "user_phone", type: "varchar", length: 20 })
  phone!: string;

  @Column({ name: "user_is_active", type: "boolean", default: true })
  isActive!: boolean;

  @Column({ name: "user_created_at", type: "timestamptz" })
  createdAt!: Date;

  @Column({ name: "user_updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
