import {
  RolAggregate,
  RolCode,
  RolCodeAlreadyExistsException,
  RolName,
  RolNameAlreadyExistsException,
} from "@/context/rol/domain";
import { RolRepository } from "@/context/rol/domain/rol.respository";
import { CreateRolApplicationParams } from "@/context/rol/domain/types/create-rol-application-params";

export class CreateRolUseCase {
  constructor(private readonly repository: RolRepository) {}

  public async execute(params: CreateRolApplicationParams): Promise<void> {
    const code = RolCode.create(params.code);

    if (await this.repository.existsByCode(code)) {
      throw new RolCodeAlreadyExistsException(code.value);
    }

    const name = RolName.create(params.name);

    if (await this.repository.existsByName(name)) {
      throw new RolNameAlreadyExistsException(name.value);
    }

    const newRol = RolAggregate.create({
      code,
      name,
    });

    await this.repository.save(newRol);
  }
}
