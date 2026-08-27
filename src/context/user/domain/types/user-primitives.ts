import { UserRolScopeEnum } from "./user-rol-scope.enum";
import { UserSexEnum } from "./user-sex.enum";

export interface UserPrimitives {
    id: string;
    tenantId: string;
    branchId: string | null;
    rolId: string;
    rolScope: UserRolScopeEnum;
    rolName: string;
    userName: string;
    email: string | null;
    password: string;
    firstName: string;
    secondName: string | null;
    firstLastName: string;
    secondLastName: string | null;
    age: Date;
    sex: UserSexEnum;
    phone: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}