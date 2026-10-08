/**
 * Estados de cualquier entidad que se pueda pausar o eliminar sin borrar la
 * fila. Lo comparten todos los módulos, así que en la base cada tabla guarda el
 * mismo texto y el front recibe los mismos valores.
 *
 * - ACTIVE: se usa con normalidad.
 * - INACTIVE: pausado; se ve en los listados pero no se puede usar.
 * - ARCHIVED: reservado para la papelera. Todavía nadie llega a este estado.
 * - DELETED: eliminado. No se muestra ni se puede modificar, y la fila se
 *   conserva para que la historia siga apuntando a algo.
 */
export enum EntityStatus {
    Active = 'ACTIVE',
    Inactive = 'INACTIVE',
    Archived = 'ARCHIVED',
    Deleted = 'DELETED',
}


/** Todos los valores, para validar lo que llega de la base o de afuera. */
export const ENTITY_STATUSES: readonly EntityStatus[] = Object.values(EntityStatus);


/**
 * Los que un usuario puede elegir al actualizar. Eliminar tiene su propio
 * endpoint, y archivar llegará con la papelera.
 */
export const ENTITY_STATUSES_USER_SET: readonly EntityStatus[] = [
    EntityStatus.Active,
    EntityStatus.Inactive,
];


/** Los que salen en un listado normal. */
export const VISIBLE_ENTITY_STATUSES: ReadonlySet<EntityStatus> = new Set([
    EntityStatus.Active,
    EntityStatus.Inactive,
]);