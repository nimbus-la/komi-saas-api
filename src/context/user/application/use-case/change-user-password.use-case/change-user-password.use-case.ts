import {
  IncorrectCurrentPasswordException,
  UnauthorizedPasswordChangeException,
  UserHashedPassword,
  UserId,
  UserNotFoundException,
  UserPlainPassword,
  UserRepository,
  UserRolScope,
  UserTenantId,
} from "@/context/user/domain";
import { PasswordHasher } from "../../ports/password-hasher";

export interface ChangeUserPasswordParams {
  currentPassword?: string;
  newPassword: string;
}

export class ChangeUserPasswordUseCase {
  constructor(
    private readonly repository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  public async execute(
    tenantId: string,
    authenticatedUserId: string,
    rolScope: string,
    targetUserId: string,
    params: ChangeUserPasswordParams,
  ): Promise<void> {
    const tenant = UserTenantId.create(tenantId);
    const targetId = UserId.create(targetUserId);

    const user = await this.repository.searchAggregateById(tenant, targetId);

    if (user === null) {
      throw new UserNotFoundException(targetUserId);
    }

    const isOwnPassword = authenticatedUserId === targetUserId;
    const scope = UserRolScope.create(rolScope);
    const isAdministrative = scope.isAdministrative();

    if (!isOwnPassword && !isAdministrative) {
      throw new UnauthorizedPasswordChangeException();
    }

    if (isOwnPassword) {
      if (params.currentPassword === undefined) {
        throw new IncorrectCurrentPasswordException();
      }

      const currentPassword = UserPlainPassword.create(params.currentPassword);

      const currentHash = user.toPrimitives().password;

      const isValid = await this.passwordHasher.verify(
        currentPassword.expose(),
        currentHash,
      );

      if (!isValid) {
        throw new IncorrectCurrentPasswordException();
      }
    }

    const newPassword = UserPlainPassword.create(params.newPassword);

    const hashedPassword = await this.passwordHasher.hash(newPassword);

    user.changePassword(UserHashedPassword.fromHash(hashedPassword));

    await this.repository.update(tenant, user);
  }
}
