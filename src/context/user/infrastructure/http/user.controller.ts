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

  @Post()
  public async create(@Body() body: CreateUserDto): Promise<void> {
    await this.createUser.execute(body);
  }

  @Patch(":id")
  public async update(
    @Param("id") id: string,
    @Body() body: UpdateUserDto,
  ): Promise<void> {
    await this.updateUser.execute(id, body);
  }

  @Patch("status/:id")
  public async toggleStatus(@Param("id") id: string): Promise<void> {
    await this.toggleUserStatus.execute(id);
  }

  @Patch("reassign/:id")
  public async reassign(
    @Param("id") id: string,
    @Body() body: ReassignUserDto,
  ): Promise<void> {
    await this.reassignUser.execute(id, body);
  }

  @Get()
  public async searchAllUsers(@Query() query: SearchUsersDto) {
    const { pageNumber, pageSize } = query;

    return this.searchAll.execute({
      pageNumber,
      pageSize,
    });
  }

  @Get(":id")
  public async searchUserById(@Param("id") id: string) {
    return this.searchById.execute(id);
  }
}
