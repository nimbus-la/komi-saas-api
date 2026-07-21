import {
  RolCode,
  RolCodeAlreadyExistsException,
  RolId,
  RolName,
  RolNameAlreadyExistsException,
  RolNotFoundException,
} from "@/context/rol/domain";
import { RolRepository } from "@/context/rol/domain/rol.respository";

export interface UpdateRolParams {
  code?: string;
  name?: string;
}

export class UpdateRolUseCase {
  constructor(private readonly repository: RolRepository) {}

  public async execute(
    id: string,
    params: UpdateRolParams,
  ): Promise<void> {
    const rol = await this.repository.searchAggregateById(RolId.create(id));

    if (rol === null) {
      throw new RolNotFoundException(id);
    }

    let code: RolCode | undefined;
    let name: RolName | undefined;

    if (params.code !== undefined) {
      code = RolCode.create(params.code);

      if (await this.repository.existsByCode(code)) {
        throw new RolCodeAlreadyExistsException(params.code);
      }
    }

    if (params.name !== undefined) {
      name = RolName.create(params.name);

      if (await this.repository.existsByName(name)) {
        throw new RolNameAlreadyExistsException(params.name);
      }
    }

    rol.update({
      ...(code ? { code } : {}),
      ...(name ? { name } : {}),
    });

    await this.repository.update(rol);
  }
}
