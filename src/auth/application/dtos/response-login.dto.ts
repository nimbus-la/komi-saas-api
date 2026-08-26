export interface ResponseLoginDto {
    userId: string;
    tenantId: string;
    branchId: string | null;
    rolScope: string;
    userName: string;
    firstName: string;
    secondName: string | null;
    firstLastName: string;
    secondLastName: string | null;
    sex: string;
}