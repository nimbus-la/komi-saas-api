import {
  AllExceptionsFilter,
  ResponseInterceptor,
} from "@/infrastructure";
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseFilters,
  UseInterceptors,
} from "@nestjs/common";
import { UpdateUserDto } from "./dto/update-user.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import {
  CreateUserUseCase,
  SearchAllUsersUseCase,
  SearchUserUseCase,
  UpdateUserUseCase,
} from "../../application";

@UseInterceptors(ResponseInterceptor)
@UseFilters(AllExceptionsFilter)
@Controller("user")
export class UserController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly updateUser: UpdateUserUseCase,
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

  @Get()
  public async searchAllUsers() {
    return this.searchAll.execute();
  }

  @Get(":id")
  public async searchUserById(@Param("id") id: string) {
    return this.searchById.execute(id);
  }
}
