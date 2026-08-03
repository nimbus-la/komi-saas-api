import { UserSexEnum } from "./user-sex.enum";

export interface UserCreatedProps {
  userId: string;
  tenantId: string;
  branchId: string | null;
  rolId: string;
  rolScope: string;
  userName: string;
  email: string;
  fullName: string;
  lastName: string;
  age: Date;
  sex: UserSexEnum;
  phone: string;
  isActive: boolean;
}