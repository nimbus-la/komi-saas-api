import { Body, Controller, Get, Patch } from "@nestjs/common";

import { ResponseMessage } from "@/infrastructure";

import { UpdateMenuIsNewDto } from "./dto/update-menu-is-new.dto";
import { GetMenuUseCase, UpdateMenuIsNewUseCase } from "../../application";

@Controller("menus")
export class MenuController {
    constructor(
        private readonly getMenu: GetMenuUseCase,
        private readonly updateMenuIsNew: UpdateMenuIsNewUseCase,
    ) { }

    /**
     * El árbol completo del sidebar. Sin paginar: es un árbol, no un listado, y
     * el front lo necesita entero para pintarlo.
     *
     * Requiere sesión (el guard de JWT es global) aunque todavía no mire quién
     * pregunta: recortar por rol es el siguiente paso y entra en el repositorio.
     */
    @Get()
    public async find() {
        return await this.getMenu.execute();
    }

    /**
     * Enciende o apaga el distintivo de "nuevo" de un menú.
     *
     * El menú se señala por id, el mismo que viaja en la respuesta del árbol.
     * No lleva tenant: el sidebar es catálogo de plataforma y la marca es igual
     * para todos los negocios.
     */
    @Patch("is-new")
    @ResponseMessage("Estado del menú actualizado exitosamente.")
    public async updateIsNew(@Body() dto: UpdateMenuIsNewDto): Promise<void> {
        await this.updateMenuIsNew.execute(dto.menuId, dto.isNew);
    }
}
