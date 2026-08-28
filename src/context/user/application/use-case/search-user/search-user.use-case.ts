import {
  UserId,
  UserNotFoundException,
  UserRepository,
  UserResponse,
  UserTenantId,
} from "@/context/user/domain";

export class SearchUserUseCase {
  constructor(
    private readonly repository: UserRepository,
  ) {}

  public async execute(tenantId: string, id: string): Promise<UserResponse> {
    const user = await this.repository.searchById(
      UserTenantId.create(tenantId),
      UserId.create(id),
    );

    if (user === null) {
      throw new UserNotFoundException(id);
    }

    return user;
  }
}