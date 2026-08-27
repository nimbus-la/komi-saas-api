import {
  UserId,
  UserNotFoundException,
  UserRepository,
  UserResponse,
} from "@/context/user/domain";

export class SearchUserUseCase {
  constructor(
    private readonly repository: UserRepository,
  ) {}

  public async execute(id: string): Promise<UserResponse> {
    const user = await this.repository.searchById(
      UserId.create(id),
    );

    if (user === null) {
      throw new UserNotFoundException(id);
    }

    return user;
  }
}