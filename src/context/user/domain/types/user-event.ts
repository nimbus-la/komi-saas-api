import { UserSexEnum } from "./user-sex.enum";

export interface UserCreatedProps {
    userId: string;
    branchId: string;
    rolId: string;
    userName: string;
    email: string;
    fullName: string;
    lastName: string;
    age: Date;
    sex: UserSexEnum;
    phone: string;
    isActive: boolean;
}