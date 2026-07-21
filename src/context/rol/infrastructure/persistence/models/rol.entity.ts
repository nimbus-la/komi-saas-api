import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity("roles")
export class RolEntity {

    @PrimaryColumn({
        name: "rol_id",
        type: "uuid",
    })
    id!: string;

    @Column({
        name: "rol_code",
        type: "varchar",
        length: 20,
        unique: true,
    })
    code!: string;

    @Column({
        name: "rol_name",
        type: "varchar",
        length: 50,
        unique: true,
    })
    name!: string;

    @CreateDateColumn({
        name: "created_at",
    })
    createdAt!: Date;

    @UpdateDateColumn({
        name: "updated_at",
    })
    updatedAt!: Date;
};