export interface CreateCategoryApplicationParams {
    tenantId: string;
    name: string;
    description?: string | undefined;
}


export interface UpdateCategoryApplicationParams {
    tenantId: string;
    name?: string | undefined;
    description?: string | undefined;
    isActive?: boolean | undefined;
}
