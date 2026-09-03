import {
    InvalidMenuHierarchyException,
    Menu,
    MenuPrimitives,
    MenuTypeEnum,
} from "../../domain";
import { MenuTreeBuilder } from "./menu-tree.builder";

/**
 * Pruebas del armado del árbol del sidebar.
 *
 * Es la única pieza con lógica de verdad del contexto: todo lo demás es traer
 * filas y mapearlas. Lo que se vigila aquí es que una rama apagada se caiga
 * entera —el caso que motiva el filtro por `isActive`— y que el orden que trae
 * la consulta llegue intacto al front.
 */

const PRIMARIO = "660e8400-e29b-41d4-a716-446655441101";
const SECUNDARIO = "660e8400-e29b-41d4-a716-446655441102";
const OTRO_SECUNDARIO = "660e8400-e29b-41d4-a716-446655441103";
const TERCIARIO = "660e8400-e29b-41d4-a716-446655441104";


function menu(overrides: Partial<MenuPrimitives> & Pick<MenuPrimitives, "id" | "code" | "type">): Menu {
    return Menu.fromPrimitives({
        parentId: null,
        title: "Menú",
        subtitle: null,
        icon: null,
        url: null,
        order: 1,
        isActive: true,
        isNew: false,
        ...overrides,
    });
}


describe("MenuTreeBuilder", () => {
    it("deja como raíces sólo a los primarios", () => {
        const tree = MenuTreeBuilder.build([
            menu({ id: PRIMARIO, code: "INVENTORY", type: MenuTypeEnum.PRIMARY, title: "Inventario" }),
            menu({ id: SECUNDARIO, code: "INVENTORY_ITEMS", type: MenuTypeEnum.SECONDARY, parentId: PRIMARIO, title: "Items" }),
        ]);

        expect(tree).toHaveLength(1);
        expect(tree[0]?.title).toBe("Inventario");
        expect(tree[0]?.items).toHaveLength(1);
        expect(tree[0]?.items[0]?.title).toBe("Items");
    });


    it("anida los tres niveles", () => {
        const tree = MenuTreeBuilder.build([
            menu({ id: PRIMARIO, code: "PRIMARIO", type: MenuTypeEnum.PRIMARY }),
            menu({ id: SECUNDARIO, code: "SECUNDARIO", type: MenuTypeEnum.SECONDARY, parentId: PRIMARIO }),
            menu({ id: TERCIARIO, code: "TERCIARIO", type: MenuTypeEnum.TERTIARY, parentId: SECUNDARIO, title: "Roles" }),
        ]);

        expect(tree[0]?.items[0]?.items[0]?.title).toBe("Roles");
    });


    it("deja items vacío en las hojas", () => {
        const tree = MenuTreeBuilder.build([
            menu({ id: PRIMARIO, code: "PRIMARIO", type: MenuTypeEnum.PRIMARY }),
        ]);

        expect(tree[0]?.items).toEqual([]);
    });


    /**
     * El repositorio ya filtró los inactivos, así que un hijo cuyo padre no está
     * en la lista es la rama apagada. No se promueve a raíz: se va con el padre.
     */
    it("descarta la descendencia de un padre que no llegó", () => {
        const tree = MenuTreeBuilder.build([
            menu({ id: SECUNDARIO, code: "SECUNDARIO", type: MenuTypeEnum.SECONDARY, parentId: PRIMARIO }),
            menu({ id: TERCIARIO, code: "TERCIARIO", type: MenuTypeEnum.TERTIARY, parentId: SECUNDARIO }),
        ]);

        expect(tree).toEqual([]);
    });


    it("respeta el orden en que vienen los hermanos", () => {
        const tree = MenuTreeBuilder.build([
            menu({ id: PRIMARIO, code: "PRIMARIO", type: MenuTypeEnum.PRIMARY }),
            menu({ id: SECUNDARIO, code: "PRIMERO", type: MenuTypeEnum.SECONDARY, parentId: PRIMARIO, order: 1, title: "Primero" }),
            menu({ id: OTRO_SECUNDARIO, code: "SEGUNDO", type: MenuTypeEnum.SECONDARY, parentId: PRIMARIO, order: 2, title: "Segundo" }),
        ]);

        expect(tree[0]?.items.map((item) => item.title)).toEqual(["Primero", "Segundo"]);
    });


    it("rechaza un terciario colgado de un primario", () => {
        expect(() =>
            MenuTreeBuilder.build([
                menu({ id: PRIMARIO, code: "PRIMARIO", type: MenuTypeEnum.PRIMARY }),
                menu({ id: TERCIARIO, code: "TERCIARIO", type: MenuTypeEnum.TERTIARY, parentId: PRIMARIO }),
            ]),
        ).toThrow(InvalidMenuHierarchyException);
    });


    it("lleva el código de cada menú al front", () => {
        const tree = MenuTreeBuilder.build([
            menu({ id: PRIMARIO, code: "INVENTORY", type: MenuTypeEnum.PRIMARY }),
            menu({ id: SECUNDARIO, code: "INVENTORY_ITEMS", type: MenuTypeEnum.SECONDARY, parentId: PRIMARIO }),
        ]);

        expect(tree[0]?.code).toBe("INVENTORY");
        expect(tree[0]?.items[0]?.code).toBe("INVENTORY_ITEMS");
    });


    it("no expone isActive ni parentId", () => {
        const tree = MenuTreeBuilder.build([
            menu({ id: PRIMARIO, code: "PRIMARIO", type: MenuTypeEnum.PRIMARY }),
        ]);

        expect(tree[0]).not.toHaveProperty("isActive");
        expect(tree[0]).not.toHaveProperty("parentId");
    });
});
