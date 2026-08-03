import { UserSexEnum } from "./user-sex.enum";

export interface UserResponse {
  id: string;
  tenantId: string;
  branchId: string | null;
  rolId: string;
  userName: string;
  email: string;
  fullName: string;
  lastName: string;
  age: Date;
  sex: UserSexEnum;
  phone: string;
  createdAt: Date; 
  updatedAt: Date;
  isActive: boolean;
}
