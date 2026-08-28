import {
  UserBirthDate,
  UserEmail,
  UserEmailAlreadyExistsException,
  UserHashedPassword,
  UserId,
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
  email?: string | null;
  password?: string;
  firstName?: string;
  secondName?: string | null;
  firstLastName?: string;
  secondLastName?: string | null;
  age?: Date;
  sex?: string;
  phone?: string;
}

export class UpdateUserUseCase {
  constructor(
    private readonly repository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  public async execute(
    tenantId: string,
    id: string,
    params: UpdateUserParams,
  ): Promise<void> {
    const tenant = UserTenantId.create(tenantId);
    const userId = UserId.create(id);

    const user = await this.repository.searchAggregateById(tenant, userId);

    if (user === null) {
      throw new UserNotFoundException(id);
    }

    const current = user.toPrimitives();

    if (params.userName !== undefined || params.email !== undefined) {
      const userName = UserName.create(params.userName ?? current.userName);

      const email =
        params.email === null
          ? null
          : params.email !== undefined
            ? UserEmail.create(params.email)
            : current.email
              ? UserEmail.create(current.email)
              : null;

      if (
        params.userName !== undefined &&
        params.userName !== current.userName
      ) {
        const exists = await this.repository.existsByUserName(
          tenant,
          userName,
          userId,
        );

        if (exists) {
          throw new UserNameAlreadyExistsException(params.userName);
        }
      }

      if (
        email !== null &&
        params.email !== undefined &&
        params.email !== current.email
      ) {
        const exists = await this.repository.existsByEmail(
          tenant,
          email,
          userId,
        );

        if (exists) {
          throw new UserEmailAlreadyExistsException(email.value);
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
      params.firstName !== undefined ||
      params.secondName !== undefined ||
      params.firstLastName !== undefined ||
      params.secondLastName !== undefined ||
      params.age !== undefined ||
      params.sex !== undefined ||
      params.phone !== undefined
    ) {
      const firstName = params.firstName ?? current.firstName;

      const secondName =
        params.secondName !== undefined
          ? params.secondName
          : current.secondName;

      const firstLastName = params.firstLastName ?? current.firstLastName;

      const secondLastName =
        params.secondLastName !== undefined
          ? params.secondLastName
          : current.secondLastName;

      const birthDate = UserBirthDate.create(params.age ?? current.age);

      const sex = UserSex.create(params.sex ?? current.sex);

      const phone = UserPhone.create(params.phone ?? current.phone);

      user.updateProfile(
        firstName,
        secondName,
        firstLastName,
        secondLastName,
        birthDate,
        sex,
        phone,
      );
    }

    await this.repository.update(tenant, user);
  }
}
