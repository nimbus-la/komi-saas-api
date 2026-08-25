import {
  UserBirthDate,
  UserEmail,
  UserEmailAlreadyExistsException,
  UserFullName,
  UserHashedPassword,
  UserId,
  UserLastName,
  UserName,
  UserNameAlreadyExistsException,
  UserNotFoundException,
  UserPhone,
  UserPlainPassword,
  UserRepository,
  UserSex,
  UserTenantId,
} from "@/context/user/domain";

import { PasswordHasher } from "../../ports/password-hasher";

export interface UpdateUserParams {
  userName?: string;
  email?: string;
  password?: string;
  fullName?: string;
  lastName?: string;
  age?: Date;
  sex?: string;
  phone?: string;
}

export class UpdateUserUseCase {
  constructor(
    private readonly repository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  public async execute(id: string, params: UpdateUserParams): Promise<void> {
    const userId = UserId.create(id);

    const user = await this.repository.searchAggregateById(userId);

    if (user === null) {
      throw new UserNotFoundException(id);
    }

    const current = user.toPrimitives();
    const tenantId = UserTenantId.create(current.tenantId);

    if (params.userName !== undefined || params.email !== undefined) {
      const userName = UserName.create(params.userName ?? current.userName);

      const email = UserEmail.create(params.email ?? current.email);

      if (
        params.userName !== undefined &&
        params.userName !== current.userName
      ) {
        const exists = await this.repository.existsByUserName(
          tenantId,
          userName,
          userId,
        );

        if (exists) {
          throw new UserNameAlreadyExistsException(params.userName);
        }
      }

      if (params.email !== undefined && params.email !== current.email) {
        const exists = await this.repository.existsByEmail(
          tenantId,
          email,
          userId,
        );

        if (exists) {
          throw new UserEmailAlreadyExistsException(params.email);
        }
      }

      user.changeCredentials(email, userName);
    }

    if (params.password !== undefined) {
      const plainPassword = UserPlainPassword.create(params.password);

      const hash = await this.passwordHasher.hash(plainPassword);

      const hashedPassword = UserHashedPassword.fromHash(hash);

      user.changePassword(hashedPassword);
    }

    if (
      params.fullName !== undefined ||
      params.lastName !== undefined ||
      params.age !== undefined ||
      params.sex !== undefined ||
      params.phone !== undefined
    ) {
      const fullName = UserFullName.create(params.fullName ?? current.fullName);
      const lastName = UserLastName.create(params.lastName ?? current.lastName);
      const birthDate = UserBirthDate.create(params.age ?? current.age);
      const sex = UserSex.create(params.sex ?? current.sex);
      const phone = UserPhone.create(params.phone ?? current.phone);
      user.updateProfile(fullName, lastName, birthDate, sex, phone);
    }

    await this.repository.update(user);
  }
}
