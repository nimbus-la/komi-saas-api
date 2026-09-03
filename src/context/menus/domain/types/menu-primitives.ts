import { MenuTypeEnum } from "./menu-type.enum";

export interface MenuPrimitives {
    id: string;
    parentId: string | null;
    code: string;
    type: MenuTypeEnum;
    title: string;
    subtitle: string | null;
    icon: string | null;
    url: string | null;
    order: number;
    isActive: boolean;
    isNew: boolean;
}
