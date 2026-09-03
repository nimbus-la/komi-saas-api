import { Menu } from "../../../domain";
import { MenuEntity } from "../models/menu.entity";

export class MenuMapper {
    static toDomain(entity: MenuEntity): Menu {
        return Menu.fromPrimitives({
            id: entity.id,
            parentId: entity.parentId,
            code: entity.code,
            type: Menu.parseType(entity.type),
            title: entity.title,
            subtitle: entity.subtitle,
            icon: entity.icon,
            url: entity.url,
            order: entity.order,
            isActive: entity.isActive,
            isNew: entity.isNew,
        });
    }
}
