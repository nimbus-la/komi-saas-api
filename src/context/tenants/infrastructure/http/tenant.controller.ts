import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";

import { ResponseMessage } from "@/infrastructure";
import {
  CreateTenantUseCase,
  DeleteTenantUseCases,
  SearchTenantUseCase,
  ToggleTenantStatusUseCase,
  UpdateTenantUseCase,
} from "../../application";
import { CurrentUser } from "@/auth/infrastructure/decorators";
import type { AuthenticatedUser } from "@/auth/infrastructure/types";

import { CreateTenantDto } from "./dto/create-tenant.dto";
import { UpdateTenantDto } from "./dto/update-tenant.dto";

@Controller("tenant")
export class TenantController {
  constructor(
    private readonly createTenant: CreateTenantUseCase,
    private readonly searchTenantById: SearchTenantUseCase,
    private readonly updateTenant: UpdateTenantUseCase,
    private readonly toggleTenantStatus: ToggleTenantStatusUseCase,
    private readonly deleteTenant: DeleteTenantUseCases,
  ) {}

  @Post()
  @ResponseMessage("Tenant creado exitosamente.")
  public async create(@Body() dto: CreateTenantDto) {
    await this.createTenant.execute({
      // accountId: dto.accountId,
      name: dto.name,
      description: dto.description,
      slug: dto.slug,
      nit: dto.nit,
    });
  }

  /**
   * Antes devolvía todos los negocios de la plataforma —nombre, NIT, slug— a
   * cualquiera con un token. Ahora devuelve el del solicitante y nada más.
   *
   * Listar la plataforma entera es una operación de administración, y para eso
   * hace falta un rol por encima del negocio que hoy no existe: todos los roles
   * (OWNER, ADMIN, CASHIER...) viven dentro de un tenant. Cuando ese rol exista,
   * SearchAllTenantsUseCase es lo que hay que colgarle.
   */
  @Get()
  public async findAll(@CurrentUser() user: AuthenticatedUser) {
    const tenant = await this.searchTenantById.execute(user.tenantId);

    return tenant === null ? [] : [tenant];
  }

  /**
   * En estas rutas el identificador ES el del negocio, así que se llama tenantId
   * y no id: con ese nombre el guard de alcance lo compara contra el del token y
   * las cubre sin lógica extra. La URL no cambia.
   */
  @Get(":tenantId")
  public async findOne(@Param("tenantId") tenantId: string) {
    return await this.searchTenantById.execute(tenantId);
  }

  @Patch(":tenantId")
  @ResponseMessage("Tenant actualizado exitosamente.")
  public async update(
    @Param("tenantId") tenantId: string,
    @Body() dto: UpdateTenantDto,
  ): Promise<void> {
    await this.updateTenant.execute(tenantId, dto);
  }

  @Patch("status/:tenantId")
  @ResponseMessage("Estado del tenant actualizado exitosamente.")
  public async toggleStatus(@Param("tenantId") tenantId: string): Promise<void> {
    await this.toggleTenantStatus.execute(tenantId);
  }

  @Delete("delete/:tenantId")
  @ResponseMessage("Tenant eliminado exitosamente.")
  public async delete(@Param("tenantId") tenantId: string): Promise<void> {
    await this.deleteTenant.execute(tenantId);
  }
}
