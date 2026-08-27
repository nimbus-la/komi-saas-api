import {
  UserRepository,
  UserResponse,
} from "@/context/user/domain";
import { Paginated, Pagination } from "@/interfaces";

export class SearchAllUsersUseCase {
  constructor(
    private readonly repository: UserRepository,
  ) {}

  public async execute(
    pagination: Pagination,
  ): Promise<Paginated<UserResponse>> {
    return this.repository.searchAll(pagination);
  }
}