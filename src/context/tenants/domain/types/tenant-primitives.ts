export interface TenantPrimitives {
    id: string;
    //accountId: string;
    name: string;
    description: string;
    slug: string;
    nit: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}