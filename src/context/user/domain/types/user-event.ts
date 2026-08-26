import { UserSexEnum } from "./user-sex.enum";

export interface UserCreatedProps {
  userId: string;
  tenantId: string;
  branchId: string | null;
  rolId: string;
  rolScope: string;
  userName: string;
  email: string  | null;
  firstName: string;
  secondName: string | null;
  firstLastName: string;
  secondLastName: string | null;
  age: Date;
  sex: UserSexEnum;
  phone: string;
  isActive: boolean;
}