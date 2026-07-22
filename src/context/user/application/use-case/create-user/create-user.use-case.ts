import { BranchId, BranchRepository } from "@/context/branch/domain";
import { BranchNotFoundException } from "@/context/inventory";
import { RolId, RolNotFoundException } from "@/context/rol/domain";
import { RolRepository } from "@/context/rol/domain/rol.respository";
import {
  CreateUserApplicationParams,
  UserAge,
  UserAggregate,
  UserBranchId,
  UserEmail,
  UserEmailAlreadyExistsException,
  UserFullName,
  UserLastName,
  UserName,
  UserNameAlreadyExistsException,
  UserPassword,
  UserPhone,
  UserRepository,
  UserRolId,
  UserSex,
} from "@/context/user/domain";

export class CreateUserUseCase {
  constructor(
    private readonly repository: UserRepository,
    private readonly branchRepository: BranchRepository,
    private readonly rolRepository: RolRepository,
  ) {}

  public async execute(params: CreateUserApplicationParams): Promise<void> {
    const branchId = UserBranchId.create(params.branchId);
    const rolId = UserRolId.create(params.rolId);

    const branch = await this.branchRepository.searchById(
      BranchId.create(branchId.value),
    );

    if (!branch) {
      throw new BranchNotFoundException(params.branchId);
    }

    const rol = await this.rolRepository.searchById(RolId.create(rolId.value));

    if (!rol) {
      throw new RolNotFoundException(params.rolId);
    }

    const email = UserEmail.create(params.email);

    if (await this.repository.existsByEmail(email)) {
      throw new UserEmailAlreadyExistsException(params.email);
    }

    const userName = UserName.create(params.userName);

    if (await this.repository.existsByUserName(userName)) {
      throw new UserNameAlreadyExistsException(params.userName);
    }

    const user = UserAggregate.create({
      branchId,
      rolId,
      userName,
      email,
      password: UserPassword.create(params.password),
      fullName: UserFullName.create(params.fullName),
      lastName: UserLastName.create(params.lastName),
      age: UserAge.create(params.age),
      sex: UserSex.create(params.sex),
      phone: UserPhone.create(params.phone),
    });

    await this.repository.save(user);
  }
}
