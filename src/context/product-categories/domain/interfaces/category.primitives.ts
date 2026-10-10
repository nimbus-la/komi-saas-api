import { EntityStatus } from "@/shared";


export interface CategoryPrimitives {
    id: string;
    tenantId: string;
    name: string;
    description: string | undefined;
    status: EntityStatus;
    createdAt: Date;
    updatedAt: Date;
}
