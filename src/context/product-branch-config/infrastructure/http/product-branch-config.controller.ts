import { Body, Controller, Delete, Get, Patch, Query } from "@nestjs/common";

import { ResponseMessage } from "@/infrastructure";
import { CurrentUser } from "@/auth/infrastructure/decorators";
import type { AuthenticatedUser } from "@/auth/infrastructure/types";

import { ConfigureProductBranchDto } from "./dto/configure-product-branch.dto";
import { SearchProductBranchConfigsDto } from "./dto/search-product-branch-configs.dto";
import { RemoveProductBranchConfigDto } from "./dto/remove-product-branch-config.dto";
import {
    ConfigureProductBranchUseCase,
    RemoveProductBranchConfigUseCase,
    SearchProductBranchConfigsUseCase,
} from "../../application";


/**
 * Precio y estado de los productos por sucursal, dentro del negocio de quien
 * pregunta. El tenantId sale del token con @CurrentUser, nunca de la petición.
 */
@Controller("products/branch-configs")
export class ProductBranchConfigController {
    constructor(
        private readonly configureProductBranch: ConfigureProductBranchUseCase,
        private readonly searchProductBranchConfigs: SearchProductBranchConfigsUseCase,
        private readonly removeProductBranchConfig: RemoveProductBranchConfigUseCase,
    ) { }


    @Get()
    public async search(
        @CurrentUser() user: AuthenticatedUser,
        @Query() query: SearchProductBranchConfigsDto,
    ) {
        return this.searchProductBranchConfigs.execute({ ...query, tenantId: user.tenantId });
    }


    /** Devuelve todas las configuraciones del producto después del cambio. */
    @Patch("configure")
    @ResponseMessage("Configuración del producto en la sucursal guardada exitosamente.")
    public async configure(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: ConfigureProductBranchDto,
    ) {
        return this.configureProductBranch.execute({ ...dto, tenantId: user.tenantId });
    }


    @Delete("delete")
    @ResponseMessage("Configuración del producto en la sucursal eliminada exitosamente.")
    public async remove(
        @CurrentUser() user: AuthenticatedUser,
        @Query() query: RemoveProductBranchConfigDto,
    ): Promise<void> {
        await this.removeProductBranchConfig.execute({ ...query, tenantId: user.tenantId });
    }
}
