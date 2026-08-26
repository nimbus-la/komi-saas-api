import { UserRolScopeEnum } from "./user-rol-scope.enum";
import { UserSexEnum } from "./user-sex.enum";

export interface UserResponse {
  id: string;
  tenantId: string;
  branchId: string | null;
  rolId: string;
  rolName?: string;
  rolScope: UserRolScopeEnum;
  userName: string;
  email: string | null;
  firstName: string;
  secondName: string | null;
  firstLastName: string;
  secondLastName: string | null;
  age: Date;
  sex: UserSexEnum;
  phone: string;
  createdAt: Date; 
  updatedAt: Date;
  isActive: boolean;
}
