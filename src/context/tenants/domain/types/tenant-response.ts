
export interface TenantResponse {
    id: string;
    accountId: string;
    name: string;
    description: string;
    slug: string;
    nit: string;
    created_at: Date;
    updated_at: Date;
    isActive: boolean;

   // branches?: BranchEntity[] | undefined;
}