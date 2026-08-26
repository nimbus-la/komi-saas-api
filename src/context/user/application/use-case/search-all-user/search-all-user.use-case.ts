import {
  UserRepository,
  UserResponse,
} from "@/context/user/domain";

import { RolFinder } from "../../ports/rol-finder";

export class SearchAllUsersUseCase {
  constructor(
    private readonly repository: UserRepository,
    private readonly rolFinder: RolFinder,
  ) {}

  public async execute(): Promise<UserResponse[]> {
    const users = await this.repository.searchAll();

    return Promise.all(
      users.map(async (user) => {
        const rol = await this.rolFinder.findById(user.rolId);

        return {
          ...user,
          rolName: rol?.name ?? "",
        };
      }),
    );
  }
}