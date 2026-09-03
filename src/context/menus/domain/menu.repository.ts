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

    /**
     * Un menú por id, activo o no: apagar el distintivo de "nuevo" de una rama
     * que ya se ocultó del sidebar tiene que seguir siendo posible.
     */
    abstract findById(id: string): Promise<Menu | null>;

    /**
     * Persiste únicamente el distintivo de "nuevo".
     *
     * El resto de la fila lo siembra el SQL y nadie más lo toca, así que un
     * update completo sólo abriría la puerta a pisarlo por accidente.
     */
    abstract updateIsNew(menu: Menu): Promise<void>;
}
