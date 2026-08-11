export interface CategoryPrimitives {
    id: string;
    tenantId: string;
    name: string;
    description: string | undefined;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}