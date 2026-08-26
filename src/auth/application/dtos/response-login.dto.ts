export interface ResponseLoginDto {
    tenantId: string;
    branchId: string | null;
    userId: string;
    userName: string;
    name: string;
    lastName: string;
    sex: string;
}