export interface CreateUserApplicationParams {
  tenantId: string;
  branchId?: string | null;
  rolId: string;
  userName: string;
  email?: string | null;
  password: string;
  firstName: string;
  secondName?: string | null;
  firstLastName: string;
  secondLastName?: string | null;
  age: Date;
  sex: string;
  phone: string;
}
