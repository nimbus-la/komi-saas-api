import {
  UserId,
  UserNotFoundException,
  UserRepository,
} from "@/context/user/domain";

export class ActivateUserUseCase {
  constructor(private readonly repository: UserRepository) {}

  public async execute(id: string): Promise<void> {
    const user = await this.repository.searchAggregateById(UserId.create(id));

    if (user === null) {
      throw new UserNotFoundException(id);
    }

    user.activate();

    await this.repository.update(user);
  }
}
