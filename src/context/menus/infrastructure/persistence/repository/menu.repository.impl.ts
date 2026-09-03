import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Menu, MenuRepository } from "../../../domain";
import { MenuMapper } from "../mappers/menu.mapper";
import { MenuEntity } from "../models/menu.entity";

@Injectable()
export class MenuRepositoryImpl extends MenuRepository {
    constructor(
        @InjectRepository(MenuEntity)
        private readonly menuRepository: Repository<MenuEntity>,
    ) {
        super();
    }

    async findAllActive(): Promise<Menu[]> {
        const rows = await this.menuRepository.find({
            where: { isActive: true },
            // El título desempata los que comparten orden, para que dos menús
            // con el mismo `menu_order` no se intercambien entre peticiones.
            order: { order: "ASC", title: "ASC" },
        });

        return rows.map((row) => MenuMapper.toDomain(row));
    }
}
