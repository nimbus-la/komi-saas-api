import { UserSexEnum } from "./user-sex.enum";

export interface UserPrimitives {
    id: string;
    branchId: string;
    rolId: string;
    userName: string;
    email: string;
    password: string;
    fullName: string;
    lastName: string;
    age: Date;
    sex: UserSexEnum;
    phone: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}