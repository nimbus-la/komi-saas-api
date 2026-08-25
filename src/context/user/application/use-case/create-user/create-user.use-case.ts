import {
  CreateUserApplicationParams,
  UserBirthDate,
  UserAggregate,
  UserBranchId,
  UserEmail,
  UserEmailAlreadyExistsException,
  UserFullName,
  UserHashedPassword,
  UserLastName,
  UserName,
  UserNameAlreadyExistsException,
  UserPhone,
  UserPlainPassword,
  UserRepository,
  UserRolId,
  UserTenantId,
  UserSex,
  UserBranchNotFoundException,
  UserTenantNotFoundException,
  UserRolNotFoundException,
} from "@/context/user/domain";

import { PasswordHasher } from "../../ports/password-hasher";
import { TenantChecker } from "../../ports/tenant-checker";
import { BranchChecker } from "../../ports/branch-checker";
import { RolFinder } from "../../ports/rol-finder";
import { EventPublisher } from "@/shared";

export class CreateUserUseCase {
  constructor(
    private readonly repository: UserRepository,
    private readonly tenantChecker: TenantChecker,
    private readonly branchChecker: BranchChecker,
    private readonly rolFinder: RolFinder,
    private readonly passwordHasher: PasswordHasher,
    private readonly eventPublisher: EventPublisher,
  ) {}

  public async execute(params: CreateUserApplicationParams): Promise<void> {
    const tenantExists = await this.tenantChecker.exists(params.tenantId);

    if (!tenantExists) {
      throw new UserTenantNotFoundException(params.tenantId);
    }

    if (params.branchId) {
      const branchExists = await this.branchChecker.existsInTenant(
        params.branchId,
        params.tenantId,
      );

      if (!branchExists) {
        throw new UserBranchNotFoundException(params.branchId);
      }
    }
    const rolScope = await this.rolFinder.findScopeById(params.rolId);

    if (!rolScope) {
      throw new UserRolNotFoundException(params.rolId);
    }

    const tenantId = UserTenantId.create(params.tenantId);

    const email = UserEmail.create(params.email);

    if (await this.repository.existsByEmail(tenantId, email)) {
      throw new UserEmailAlreadyExistsException(params.email);
    }

    const userName = UserName.create(params.userName);

    if (await this.repository.existsByUserName(tenantId, userName)) {
      throw new UserNameAlreadyExistsException(params.userName);
    }

    const plainPassword = UserPlainPassword.create(params.password);

    const hash = await this.passwordHasher.hash(plainPassword);

    const hashedPassword = UserHashedPassword.fromHash(hash);

    const user = UserAggregate.create({
      tenantId: UserTenantId.create(params.tenantId),

      branchId: params.branchId ? UserBranchId.create(params.branchId) : null,

      rolId: UserRolId.create(params.rolId),

      rolScope,

      userName,
      email,
      password: hashedPassword,
      fullName: UserFullName.create(params.fullName),
      lastName: UserLastName.create(params.lastName),
      age: UserBirthDate.create(params.age),
      sex: UserSex.create(params.sex),
      phone: UserPhone.create(params.phone),
    });

    await this.repository.save(user);

    await this.eventPublisher.publish(user.getDomainEvents());
    user.clearDomainEvents();
  }
}
