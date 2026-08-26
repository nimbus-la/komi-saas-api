/**
 * Lo que el caso de uso de login necesita para trabajar.
 *
 * Llega desde el controlador ya validado en forma (que sean textos, que no vengan
 * vacíos, que respeten los topes), pero todavía en crudo. La normalización del
 * slug y del username la hace el caso de uso, no quien lo llama.
 */
export interface LoginParams {
    /** Identificador del negocio tal cual viene en la petición, sin normalizar. */
    tenantSlug: string;

    /** Nombre de usuario dentro de ese negocio. Se compara respetando mayúsculas. */
    username: string;

    /** Contraseña en texto plano. Viaja hasta el verificador y no se toca en el camino. */
    password: string;
}
