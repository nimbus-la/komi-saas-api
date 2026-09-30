export interface ProductBranchConfigPrimitives {
    id: string;
    tenantId: string;
    productId: string;
    branchId: string;
    price: string | null;
    currency: string | null;
    isAvailable: boolean | null;
    createdAt: Date;
    updatedAt: Date;
}
