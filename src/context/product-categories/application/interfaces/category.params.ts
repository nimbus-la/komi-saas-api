import { EntityStatus } from "@/shared";

export interface CreateCategoryApplicationParams {
    tenantId: string;
    name: string;
    description?: string | undefined;
}


export interface UpdateCategoryApplicationParams {
    tenantId: string;
    categoryId: string;
    name?: string | undefined;
    description?: string | undefined;
    status?: EntityStatus;
}


export interface DeleteCategoryApplicationParams {
    categoryId: string;
    tenantId: string;
}