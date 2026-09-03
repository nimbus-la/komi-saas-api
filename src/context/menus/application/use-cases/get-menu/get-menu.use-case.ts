import { MenuRepository, MenuResponse } from "../../../domain";
import { MenuTreeBuilder } from "../../services/menu-tree.builder";

export class GetMenuUseCase {
    constructor(
        private readonly repository: MenuRepository,
    ) { }

    public async execute(): Promise<MenuResponse[]> {
        const menus = await this.repository.findAllActive();

        return MenuTreeBuilder.build(menus);
    }
}
