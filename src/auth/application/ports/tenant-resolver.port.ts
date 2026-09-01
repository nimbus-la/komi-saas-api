import { ResolvedTenant } from "../dtos/tenant-resolver.dto";

/**
 * Llega hasta el negocio, por slug o por id.
 *
 * Por slug es el primer paso del login: sin el id del negocio no se puede buscar
 * al usuario, porque el mismo username puede existir en varios a la vez. Por id
 * lo usa la renovación, que ya lo tiene guardado en la sesión.
 */
export abstract class TenantResolver {
    /**
     * Devuelve null cuando no hay ningún negocio con ese slug, y también cuando el
     * slug viene mal formado. Quien llama no tiene por qué distinguir entre las
     * dos cosas.
     */
    abstract findBySlug(slug: string): Promise<ResolvedTenant | null>;

    /**
     * El negocio guardado en una sesión. Hace falta para volver a comprobar su
     * estado al renovar: entre el login y el refresh pueden pasar días, y en ese
     * rato el negocio puede haberse dado de baja.
     *
     * Mismo criterio que findBySlug con el id mal formado: null.
     */
    abstract findById(tenantId: string): Promise<ResolvedTenant | null>;
}
