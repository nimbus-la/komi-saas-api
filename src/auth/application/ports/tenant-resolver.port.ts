import { ResolvedTenant } from "../dtos/tenant-resolver.dto";

/**
 * Traduce el slug que viene en la petición al negocio real.
 *
 * Es el primer paso del login: sin el id del negocio no se puede buscar al
 * usuario, porque el mismo username puede existir en varios negocios a la vez.
 */
export abstract class TenantResolver {
    /**
     * Devuelve null cuando no hay ningún negocio con ese slug, y también cuando el
     * slug viene mal formado. Quien llama no tiene por qué distinguir entre las
     * dos cosas.
     */
    abstract findBySlug(slug: string): Promise<ResolvedTenant | null>;
}
