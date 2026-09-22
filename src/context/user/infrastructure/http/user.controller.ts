import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";

import { type AuthenticatedUser, CurrentUser } from "@/auth/infrastructure";

import { UpdateUserDto } from "./dto/update-user.dto";
import { CreateUserDto } from "./dto/create-user.dto";

import {
  ChangeUserPasswordUseCase,
  CreateUserUseCase,
  ReassignUserUseCase,
  SearchAllUsersUseCase,
  SearchUserUseCase,
  ToggleUserStatusUseCase,
  UpdateUserUseCase,
} from "../../application";

import { ReassignUserDto } from "./dto/reassign-user.dto";
import { SearchUsersDto } from "./dto/search-users.dto";
import { ChangeUserPasswordDto } from "./dto/change-user-password.dto";

@Controller("user")
export class UserController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly updateUser: UpdateUserUseCase,
    private readonly changeUserPassword: ChangeUserPasswordUseCase,
    private readonly toggleUserStatus: ToggleUserStatusUseCase,
    private readonly reassignUser: ReassignUserUseCase,
    private readonly searchById: SearchUserUseCase,
    private readonly searchAll: SearchAllUsersUseCase,
  ) {}

  @Post()
  public async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateUserDto,
  ): Promise<void> {
    const { tenantId } = user;

    await this.createUser.execute({ ...body, tenantId });
  }

  @Patch("update")
  public async update(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateUserDto,
  ): Promise<void> {
    await this.updateUser.execute(user.tenantId, body.userId, body);
  }

  @Patch("password")
  public async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: ChangeUserPasswordDto,
  ): Promise<void> {
    await this.changeUserPassword.execute(
      user.tenantId,
      user.userId,
      user.rolScope,
      body.userId,
      {
        ...(body.currentPassword !== undefined && {
          currentPassword: body.currentPassword,
        }),
        newPassword: body.newPassword,
      },
    );
  }

  @Patch("status")
  public async toggleStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { userId: string },
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

  @Get()
  public async searchAllUsers(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: SearchUsersDto,
  ) {
    const { pageNumber, pageSize, ...params } = query;

    return this.searchAll.execute(
      user.tenantId,
      { pageNumber, pageSize },
      params,
    );
  }

  @Get(":id")
  public async searchUserById(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    return this.searchById.execute(user.tenantId, id);
  }
}
