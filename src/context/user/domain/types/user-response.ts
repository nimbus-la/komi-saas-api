import { UserSexEnum } from "./user-sex.enum";

export interface UserResponse {
    id: string;
    branchId: string;
    rolId: string;
    userName: string;
    email: string;
    fullName: string;
    lastName: string;
    age: Date;
    sex: UserSexEnum;
    phone: string;
    created_at: Date;
    updated_at: Date;
    isActive: boolean;
}