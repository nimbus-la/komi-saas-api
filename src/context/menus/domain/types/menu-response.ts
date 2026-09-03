import { MenuTypeEnum } from "./menu-type.enum";

/**
 * El nodo tal como lo consume el sidebar, ya anidado.
 *
 * No lleva `isActive` ni `parentId`: el primero sólo sirve para decidir si el
 * menú sale o no —lo que llega aquí está activo por definición— y el segundo se
 * gastó al armar el árbol, la jerarquía ya está en la forma del objeto.
 */
export interface MenuResponse {
    id: string;
    /** Identificador estable con el que el front señala a este menú. */
    code: string;
    type: MenuTypeEnum;
    title: string;
    subtitle: string | null;
    icon: string | null;
    url: string | null;
    order: number;
    isNew: boolean;
    /** Vacío en las hojas, nunca ausente: el front no tiene que chequear undefined. */
    items: MenuResponse[];
}
