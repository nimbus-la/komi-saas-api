import {
  UserBirthDate,
  UserEmail,
  UserName,
  UserPhone,
  UserSex,
} from "../value-object";

export interface UserUpdateParams {
  userName?: UserName;
  email?: UserEmail | null;
  firstName?: string;
  secondName?: string | null;
  firstLastName?: string;
  secondLastName?: string | null;
  age?: UserBirthDate;
  sex?: UserSex;
  phone?: UserPhone;
}