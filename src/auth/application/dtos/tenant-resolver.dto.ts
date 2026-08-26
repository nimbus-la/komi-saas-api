export interface ResolvedTenant {
    id: string;
    name: string;
    description: string;
    slug: string;
    nit: string;
    created_at: Date;
    updated_at: Date;
    isActive: boolean;
}