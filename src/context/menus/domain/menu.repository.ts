import { Menu } from "./menu.aggregate";

export abstract class MenuRepository {
    /**
     * Todos los menús activos, en una sola consulta y ya ordenados por
     * `menu_order`.
     *
     * Se traen planos y el árbol se arma en memoria: son decenas de filas, y una
     * CTE recursiva costaría más de leer que de ejecutar. Los inactivos ni
     * aparecen, así que una rama apagada se cae entera con sus hijos.
     *
     * Aquí es donde entrará el filtro por rol: cambia esta consulta y ni el
     * dominio ni el contrato con el front se enteran.
     */
    abstract findAllActive(): Promise<Menu[]>;
}
