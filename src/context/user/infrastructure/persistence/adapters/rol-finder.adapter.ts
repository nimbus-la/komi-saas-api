import { Injectable } from "@nestjs/common";

import { RolId, } from "@/context/rol/domain";
import { UserRolScope } from "@/context/user/domain";
import { RolFinder } from "@/context/user/application/ports/rol-finder";
import { RolRepository } from "@/context/rol/domain/rol.repository";

@Injectable()
export class RolFinderAdapter implements RolFinder {
  constructor(
    private readonly roles: RolRepository,
  ) {}

  public async findScopeById(
    rolId: string,
  ): Promise<UserRolScope | null> {
    const rol = await this.roles.searchAggregateById(
      RolId.create(rolId),
    );

    if (!rol) {
      return null;
    }

    return UserRolScope.create(
      rol.toPrimitives().scope,
    );
  }
}