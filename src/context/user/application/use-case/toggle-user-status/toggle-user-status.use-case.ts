import {
  UserId,
  UserNotFoundException,
  UserRepository,
  UserTenantId,
} from "@/context/user/domain";

export class ToggleUserStatusUseCase {
  constructor(
    private readonly repository: UserRepository,
  ) {}

  public async execute(tenantId: string, id: string): Promise<void> {
    const tenant = UserTenantId.create(tenantId);
    const userId = UserId.create(id);

    const user = await this.repository.searchAggregateById(
      tenant,
      userId,
    );

    if (user === null) {
      throw new UserNotFoundException(id);
    }

    if (user.toPrimitives().isActive) {
      user.deactivate();
    } else {
      user.activate();
    }

    await this.repository.update(tenant, user);
  }
}