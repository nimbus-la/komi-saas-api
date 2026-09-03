import {
    InvalidMenuHierarchyException,
    Menu,
    MenuResponse,
} from "../../domain";

/**
 * Convierte la lista plana que devuelve el repositorio en el árbol que espera el
 * sidebar.
 *
 * Una sola pasada sobre los menús, con un índice por id: cada nodo se cuelga de
 * su padre y sólo las raíces quedan en el resultado.
 */
export class MenuTreeBuilder {
    public static build(menus: Menu[]): MenuResponse[] {
        const nodes = new Map<string, { menu: Menu; response: MenuResponse }>();

        for (const menu of menus) {
            nodes.set(menu.id.value, { menu, response: menu.toResponse() });
        }

        const roots: MenuResponse[] = [];

        // El Map conserva el orden de inserción, que es el de la consulta
        // (ORDER BY menu_order). Así los hermanos se van agregando ya ordenados
        // y no hace falta ordenar de nuevo.
        for (const { menu, response } of nodes.values()) {
            const parentId = menu.getParentId();

            if (parentId === null) {
                roots.push(response);
                continue;
            }

            const parent = nodes.get(parentId);

            /**
             * Huérfano: el padre no está entre los menús activos.
             *
             * Se descarta con toda su descendencia, que es justo lo que se
             * quiere al apagar una rama: desactivar "Inventario" tiene que
             * llevarse "Items" y "Movimientos", no dejarlos sueltos en la raíz
             * del sidebar.
             */
            if (parent === undefined) continue;

            MenuTreeBuilder.ensureParentIsOfExpectedType(menu, parent.menu);

            parent.response.items.push(response);
        }

        return roots;
    }

    /**
     * Un secundario cuelga de un primario y un terciario de un secundario. Es la
     * parte de la jerarquía que ningún CHECK puede validar, porque hay que mirar
     * dos filas a la vez.
     */
    private static ensureParentIsOfExpectedType(menu: Menu, parent: Menu): void {
        const expected = menu.expectedParentType();

        if (expected !== null && parent.getType() !== expected) {
            throw new InvalidMenuHierarchyException(
                `Un menú ${menu.getType().toLowerCase()} debe colgar de uno ${expected.toLowerCase()}, no de uno ${parent.getType().toLowerCase()}.`,
            );
        }
    }
}
