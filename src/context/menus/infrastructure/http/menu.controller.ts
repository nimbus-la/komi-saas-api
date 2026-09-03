import { Controller, Get, UseFilters, UseInterceptors } from "@nestjs/common";

import { AllExceptionsFilter, ResponseInterceptor } from "@/infrastructure";

import { GetMenuUseCase } from "../../application";

@UseInterceptors(ResponseInterceptor)
@UseFilters(AllExceptionsFilter)
@Controller("menus")
export class MenuController {
    constructor(
        private readonly getMenu: GetMenuUseCase,
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
}
