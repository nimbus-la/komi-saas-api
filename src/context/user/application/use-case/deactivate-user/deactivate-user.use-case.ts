import {
  UserId,
  UserNotFoundException,
  UserRepository,
} from "@/context/user/domain";

export class DeactivateUserUseCase {
  constructor(private readonly repository: UserRepository) {}
  public async execute(id: string): Promise<void> {
    const user = await this.repository.searchAggregateById(UserId.create(id));
    if (user === null) {
      throw new UserNotFoundException(id);
    }
    user.deactivate();
    await this.repository.update(user);
  }
}
