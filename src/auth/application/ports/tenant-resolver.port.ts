import { ResolvedTenant } from "../dtos/tenant-resolver.dto";

export abstract class TenantResolver {
    abstract findBySlug(slug: string): Promise<ResolvedTenant | null>;
}