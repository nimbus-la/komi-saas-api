import {
  UserId,
  UserNotFoundException,
  UserRepository,
  UserResponse,
} from "@/context/user/domain";

import { RolFinder } from "../../ports/rol-finder";

export class SearchUserUseCase {
  constructor(
    private readonly repository: UserRepository,
    private readonly rolFinder: RolFinder,
  ) {}

  public async execute(id: string): Promise<UserResponse> {
    const user = await this.repository.searchById(
      UserId.create(id),
    );

    if (user === null) {
      throw new UserNotFoundException(id);
    }

    const rol = await this.rolFinder.findById(user.rolId);

    return {
      ...user,
      rolName: rol?.name ?? "",
    };
  }
}