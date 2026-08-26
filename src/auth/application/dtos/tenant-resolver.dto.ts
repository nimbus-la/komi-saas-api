/**
 * El negocio ya resuelto a partir del slug que llegó en la petición.
 *
 * De todo esto el login solo mira el id (para buscar al usuario dentro del
 * negocio correcto) y el isActive. El resto viene igual porque el agregado ya lo
 * tenía cargado y así se evita volver a la base si más adelante hace falta.
 */
export interface ResolvedTenant {
    id: string;
    name: string;
    description: string;

    /** El mismo slug de la URL, ya validado por el value object del dominio. */
    slug: string;

    nit: string;
    created_at: Date;
    updated_at: Date;

    /** Un negocio inactivo bloquea el login de todos sus usuarios. */
    isActive: boolean;
}
