import { Injectable } from "@nestjs/common";

import { RolId } from "@/context/rol/domain";
import { UserRolScope } from "@/context/user/domain";
import {
  RolFinder,
  RolFinderResult,
} from "@/context/user/application/ports/rol-finder";
import { RolRepository } from "@/context/rol/domain/rol.repository";

@Injectable()
export class RolFinderAdapter implements RolFinder {
  constructor(
    private readonly roles: RolRepository,
  ) {}

  public async findById(
    rolId: string,
  ): Promise<RolFinderResult | null> {
    const rol = await this.roles.searchAggregateById(
      RolId.create(rolId),
    );

    if (!rol) {
      return null;
    }

    const primitives = rol.toPrimitives();

    return {
      name: primitives.name,
      scope: UserRolScope.create(primitives.scope),
    };
  }
}