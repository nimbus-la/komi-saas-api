import { AllExceptionsFilter, ResponseInterceptor } from "@/infrastructure";
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
  ) {}

  @Post(":tenantId")
  public async create(
    @Param("tenantId") tenantId: string,
    @Body() body: CreateUserDto,
  ): Promise<void> {
    await this.createUser.execute({
      ...body,
      tenantId,
    });
  }

  @Patch(":tenantId/:id")
  public async update(
    @Param("tenantId") tenantId: string,
    @Param("id") id: string,
    @Body() body: UpdateUserDto,
  ): Promise<void> {
    await this.updateUser.execute(tenantId, id, body);
  }

  @Patch("status/:tenantId/:id")
  public async toggleStatus(
    @Param("tenantId") tenantId: string,
    @Param("id") id: string,
  ): Promise<void> {
    await this.toggleUserStatus.execute(tenantId, id);
  }

  @Patch("reassign/:tenantId/:id")
  public async reassign(
    @Param("tenantId") tenantId: string,
    @Param("id") id: string,
    @Body() body: ReassignUserDto,
  ): Promise<void> {
    await this.reassignUser.execute(tenantId, id, body);
  }

  @Get(":tenantId")
  public async searchAllUsers(
    @Param("tenantId") tenantId: string,
    @Query() query: SearchUsersDto,
  ) {
    const { pageNumber, pageSize } = query;

    return this.searchAll.execute(tenantId, {
      pageNumber,
      pageSize,
    });
  }

  @Get(":tenantId/:id")
  public async searchUserById(
    @Param("tenantId") tenantId: string,
    @Param("id") id: string,
  ) {
    return this.searchById.execute(tenantId, id);
  }
}
