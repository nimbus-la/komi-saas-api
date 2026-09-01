import { TenantAggregate, TenantId, TenantRepository, TenantSlug } from "@/context/tenants/domain";
import { ResolvedTenant, TenantResolver } from "../../../application";
import { Injectable } from "@nestjs/common";


/**
 * Conecta el login con el módulo de negocios.
 *
 * Igual que el buscador de usuarios: arma el value object del slug, va al
 * repositorio y devuelve el agregado aplanado, para que auth no dependa de cómo
 * está construido el agregado de tenant.
 */
@Injectable()
export class TenantResolverAdapter implements TenantResolver {
    constructor(
        private readonly tenants: TenantRepository
    ) { }


    public async findBySlug(slug: string): Promise<ResolvedTenant | null> {
        let tenantSlug: TenantSlug;

        try {
            tenantSlug = TenantSlug.create(slug);
        } catch {
            // Un slug con formato invalido es un tenant inexistente.
            return null;
        }

        const tenant = await this.tenants.searchAggregateBySlug(tenantSlug);

        return tenant === null
            ? null
            : TenantResolverAdapter.toResolvedTenant(tenant);
    }


    public async findById(tenantId: string): Promise<ResolvedTenant | null> {
        let id: TenantId;

        try {
            id = TenantId.create(tenantId);
        } catch {
            // Un id con formato invalido es un tenant inexistente.
            return null;
        }

        const tenant = await this.tenants.searchAggregateById(id);

        return tenant === null
            ? null
            : TenantResolverAdapter.toResolvedTenant(tenant);
    }


    /** Aplana el agregado a la vista que usa auth. Compartido por las dos busquedas. */
    private static toResolvedTenant(tenant: TenantAggregate): ResolvedTenant {
        const primitives = tenant.toPrimitives();

        return {
            id: primitives.id,
            name: primitives.name,
            description: primitives.description,
            slug: primitives.slug,
            nit: primitives.nit,
            created_at: primitives.createdAt,
            updated_at: primitives.updatedAt,
            isActive: primitives.isActive
        };
    }
}
