import { UserRolScopeEnum } from "./user-rol-scope.enum";
import { UserSexEnum } from "./user-sex.enum";

export interface UserPrimitives {
    id: string;
    tenantId: string;
    branchId: string | null;
    rolId: string;
    rolScope: UserRolScopeEnum;
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