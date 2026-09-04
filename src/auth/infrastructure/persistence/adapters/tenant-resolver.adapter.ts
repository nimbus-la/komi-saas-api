import { TenantAggregate, TenantId, TenantRepository, TenantSlug } from "@/context/tenants/domain";
import { ResolvedTenant, TenantResolver } from "../../../application";
import { Injectable } from "@nestjs/common";
import { PinoLogger } from "nestjs-pino";


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
        private readonly tenants: TenantRepository,
        private readonly logger: PinoLogger
    ) {
        this.logger.setContext(TenantResolverAdapter.name);
    }


    public async findBySlug(slug: string): Promise<ResolvedTenant | null> {
        let tenantSlug: TenantSlug;

        try {
            tenantSlug = TenantSlug.create(slug);
        } catch (error: unknown) {
            // Un slug con formato invalido es un tenant inexistente.
            this.logger.debug({ slug, err: error }, 'El slug del negocio no es válido: se responde como inexistente');

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
        } catch (error: unknown) {
            // Un id con formato invalido es un tenant inexistente.
            this.logger.debug({ tenantId, err: error }, 'El identificador del negocio no es válido: se responde como inexistente');

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
