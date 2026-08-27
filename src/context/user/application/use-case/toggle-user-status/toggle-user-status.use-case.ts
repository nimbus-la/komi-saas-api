import { UserId, UserNotFoundException, UserRepository } from "@/context/user/domain";

export class ToggleUserStatusUseCase {
  constructor(
    private readonly repository: UserRepository,
  ) {}

  public async execute(id: string): Promise<void> {
    const user = await this.repository.searchAggregateById(
      UserId.create(id),
    );

    if (user === null) {
      throw new UserNotFoundException(id);
    }

    if (user.toPrimitives().isActive) {
      user.deactivate();
    } else {
      user.activate();
    }

    await this.repository.update(user);
  }
};