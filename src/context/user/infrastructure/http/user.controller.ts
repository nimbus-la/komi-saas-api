import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseFilters,
  UseInterceptors,
} from "@nestjs/common";

import { AllExceptionsFilter, ResponseInterceptor } from "@/infrastructure";
import { type AuthenticatedUser, CurrentUser } from "@/auth/infrastructure";

import { UpdateUserDto } from "./dto/update-user.dto";
import { CreateUserDto } from "./dto/create-user.dto";

import {
  CreateUserUseCase,
  ReassignUserUseCase,
  SearchAllUsersUseCase,
  SearchUserUseCase,
  ToggleUserStatusUseCase,
  UpdateUserUseCase,
} from "../../application";

import { ReassignUserDto } from "./dto/reassign-user.dto";
import { SearchUsersDto } from "./dto/search-users.dto";

@UseInterceptors(ResponseInterceptor)
@UseFilters(AllExceptionsFilter)
@Controller("user")
export class UserController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly updateUser: UpdateUserUseCase,
    private readonly toggleUserStatus: ToggleUserStatusUseCase,
    private readonly reassignUser: ReassignUserUseCase,
    private readonly searchById: SearchUserUseCase,
    private readonly searchAll: SearchAllUsersUseCase,
  ) { }


  @Post()
  public async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateUserDto,
  ): Promise<void> {
    const { tenantId } = user;

    await this.createUser.execute({ ...body, tenantId });
  }


  /**
   * Datos del usuario: credenciales, contraseña y perfil.
   *
   * El endpoint tiene el contrato roto. Los arreglos NO van aquí: van en
   * UpdateUserUseCase y en UpdateUserDto.
   *
   * 1. Los nombres no llegan. La DTO los llama fullName y lastName; el caso de
   *    uso espera firstName, secondName, firstLastName y secondLastName. El
   *    body se pasa sin mapear, así que esos campos se descartan y la respuesta
   *    es 200 sin haber cambiado nada. Mandar los nombres correctos da 400,
   *    porque el ValidationPipe corre con forbidNonWhitelisted.
   *
   * 2. La DTO acepta action, rolId y branchId, que son de /user/status y
   *    /user/reassign. El caso de uso ni los mira, así que se descartan igual.
   *
   * 3. Varios límites de la DTO son más flojos que los del dominio (userName,
   *    password, phone), así que el rechazo ocurre abajo y no en la entrada.
   *
   * 4. Nadie comprueba que venga al menos un campo que actualizar: un body
   *    con solo userId responde 200 y aun así escribe en la base. Es regla
   *    de negocio, va en UserAggregate; inventario ya lo resuelve así.
   *
   * 5. La contraseña no debería estar en este endpoint. Tiene reglas de
   *    autorización propias (la actual si es la mía, rol administrativo si
   *    es la de otro) que no aplican a cambiar un teléfono, y mientras
   *    compartan endpoint no puede haber una sola política coherente.
   *    TODO: ChangeUserPasswordUseCase en PATCH /user/password, igual que
   *    /user/status y /user/reassign. El agregado ya tiene changePassword()
   *    aparte; falta que la separación llegue hasta aquí.
   */
  @Patch("update")
  public async update(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateUserDto,
  ): Promise<void> {
    await this.updateUser.execute(user.tenantId, body.userId, body);
  }


  @Patch("status")
  public async toggleStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { userId: string }
  ): Promise<void> {
    await this.toggleUserStatus.execute(user.tenantId, body.userId);
  }


  @Patch("reassign")
  public async reassign(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: ReassignUserDto,
  ): Promise<void> {
    const { userId } = body;

    await this.reassignUser.execute(user.tenantId, userId, body);
  }


  /**
   * Listado de usuarios del tenant, paginado.
   *
   * Lo que falta es de este endpoint y de la capa de persistencia; el caso de
   * uso solo pasa la paginación al repositorio y no tiene nada que decidir.
   *
   * 1. No hay criterios de búsqueda ni filtros (nombres, apellidos, userName,
   *    rol, branch, status, sexo). Van declarados en SearchUsersDto y bajan
   *    hasta searchAll como parte del WHERE: filtrar en memoria la página ya
   *    traída daría páginas incompletas, porque el recorte ocurre en la base.
   *    Al declararlos hay que hacerlo primero en la DTO: el ValidationPipe
   *    corre con forbidNonWhitelisted, así que cualquier query param que no
   *    esté ahí responde 400 en vez de ignorarse.
   *
   * 2. findAndCount no lleva ORDER BY. Sin un orden determinista la base no
   *    garantiza que dos consultas devuelvan las filas en la misma secuencia,
   *    así que un mismo usuario puede salir repetido en una página y faltar en
   *    otra. Necesita un orden fijo (createdAt con id de desempate, porque
   *    createdAt puede repetirse) y llega junto con los filtros, no antes.
   */
  @Get()
  public async searchAllUsers(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: SearchUsersDto,
  ) {
    const { pageNumber, pageSize } = query;

    return this.searchAll.execute(user.tenantId, { pageNumber, pageSize });
  }


  @Get(":id")
  public async searchUserById(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    return this.searchById.execute(user.tenantId, id);
  }
}
