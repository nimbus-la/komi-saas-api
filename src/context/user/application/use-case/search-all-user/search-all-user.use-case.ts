import {
  UserRepository,
  UserResponse,
  UserTenantId,
} from "@/context/user/domain";
import { Paginated, Pagination } from "@/interfaces";

export class SearchAllUsersUseCase {
  constructor(
    private readonly repository: UserRepository,
  ) {}

  public async execute(
    tenantId: string,
    pagination: Pagination,
  ): Promise<Paginated<UserResponse>> {
    return this.repository.searchAll(UserTenantId.create(tenantId), pagination);
  }
}