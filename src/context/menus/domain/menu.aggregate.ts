import { AggregateRoot } from "@/shared";

import { MenuCode } from "./value-object/menu-code.value-object";
import { MenuId } from "./value-object/menu-id.value-object";
import { MenuTitle } from "./value-object/menu-title.value-object";
import { MenuPrimitives } from "./types/menu-primitives";
import { MenuResponse } from "./types/menu-response";
import { MenuTypeEnum } from "./types/menu-type.enum";
import {
    InvalidMenuHierarchyException,
    InvalidMenuTypeException,
} from "./exceptions/menu.exception";

/**
 * Un nodo del sidebar. Los tres niveles son este mismo agregado; lo único que
 * los distingue es el tipo y de quién cuelgan.
 *
 * Hoy es de sólo lectura: el árbol se siembra por SQL (04-menus.sql) y la API
 * únicamente lo entrega. Por eso no hay `create` ni mutadores.
 */
export class Menu extends AggregateRoot<MenuId> {
    private constructor(
        id: MenuId,
        private readonly parentId: string | null,
        private readonly code: MenuCode,
        private readonly type: MenuTypeEnum,
        private readonly title: MenuTitle,
        private readonly subtitle: string | null,
        private readonly icon: string | null,
        private readonly url: string | null,
        private readonly order: number,
        private readonly isActive: boolean,
        private readonly isNew: boolean,
    ) {
        super(id);
    }

    public static fromPrimitives(primitives: MenuPrimitives): Menu {
        Menu.ensureRootIsPrimary(primitives);

        return new Menu(
            MenuId.create(primitives.id),
            primitives.parentId,
            MenuCode.create(primitives.code),
            primitives.type,
            MenuTitle.create(primitives.title),
            primitives.subtitle,
            primitives.icon,
            primitives.url,
            primitives.order,
            primitives.isActive,
            primitives.isNew,
        );
    }

    /**
     * Traduce el tipo tal como viene de la base.
     *
     * La columna tiene un CHECK, así que un valor fuera de la lista sólo puede
     * llegar si alguien tocó el esquema. Que reviente aquí es mejor que dejar
     * pasar un menú con un tipo que el front no sabe pintar.
     */
    public static parseType(value: string): MenuTypeEnum {
        const isKnown = Object.values(MenuTypeEnum).includes(value as MenuTypeEnum);

        if (!isKnown) {
            throw new InvalidMenuTypeException(value);
        }

        return value as MenuTypeEnum;
    }

    public toPrimitives(): MenuPrimitives {
        return {
            id: this.id.value,
            parentId: this.parentId,
            code: this.code.value,
            type: this.type,
            title: this.title.value,
            subtitle: this.subtitle,
            icon: this.icon,
            url: this.url,
            order: this.order,
            isActive: this.isActive,
            isNew: this.isNew,
        };
    }

    /** El nodo sin hijos; anidarlos es trabajo de quien arma el árbol. */
    public toResponse(): MenuResponse {
        return {
            id: this.id.value,
            code: this.code.value,
            type: this.type,
            title: this.title.value,
            subtitle: this.subtitle,
            icon: this.icon,
            url: this.url,
            order: this.order,
            isNew: this.isNew,
            items: [],
        };
    }

    public getParentId(): string | null {
        return this.parentId;
    }

    public isRoot(): boolean {
        return this.parentId === null;
    }

    /**
     * De qué tipo tiene que ser el padre de este menú, o null si es raíz.
     *
     * Es la mitad de la jerarquía que la base no puede vigilar: un CHECK mira
     * una fila a la vez y esto compara dos.
     */
    public expectedParentType(): MenuTypeEnum | null {
        switch (this.type) {
            case MenuTypeEnum.PRIMARY:
                return null;
            case MenuTypeEnum.SECONDARY:
                return MenuTypeEnum.PRIMARY;
            case MenuTypeEnum.TERTIARY:
                return MenuTypeEnum.SECONDARY;
        }
    }

    public getType(): MenuTypeEnum {
        return this.type;
    }

    private static ensureRootIsPrimary(primitives: MenuPrimitives): void {
        const isPrimary = primitives.type === MenuTypeEnum.PRIMARY;
        const isRoot = primitives.parentId === null;

        if (isPrimary && !isRoot) {
            throw new InvalidMenuHierarchyException(
                `El menú "${primitives.title}" es primario y no puede colgar de otro menú.`,
            );
        }

        if (!isPrimary && isRoot) {
            throw new InvalidMenuHierarchyException(
                `El menú "${primitives.title}" es ${primitives.type.toLowerCase()} y necesita un menú padre.`,
            );
        }
    }
}
