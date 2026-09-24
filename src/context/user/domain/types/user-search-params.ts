import { UserSexEnum } from "./user-sex.enum";

export interface UserSearchParams {
  firstName?: string;
  secondName?: string;
  firstLastName?: string;
  secondLastName?: string;
  userName?: string;
  rolId?: string;
  branchId?: string;
  isActive?: boolean;
  sex?: UserSexEnum;
}