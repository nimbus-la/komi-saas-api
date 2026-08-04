export interface CreateUserApplicationParams {
  tenantId: string;
  branchId?: string | null;
  rolId: string;
  userName: string;
  email: string;
  password: string;
  fullName: string;
  lastName: string;
  age: Date;
  sex: string;
  phone: string;
}
