import {
  UserBirthDate,
  UserEmail,
  UserEmailAlreadyExistsException,
  UserId,
  UserName,
  UserNameAlreadyExistsException,
  UserNotFoundException,
  UserPhone,
  UserRepository,
  UserSex,
  UserTenantId,
  UserUpdateParams as UserAggregateUpdateParams,
} from "@/context/user/domain";

export interface UpdateUserParams {
  userName?: string;
  email?: string | null;
  firstName?: string;
  secondName?: string | null;
  firstLastName?: string;
  secondLastName?: string | null;
  birthDate?: string;
  sex?: string;
  phone?: string;
}

export class UpdateUserUseCase {
  constructor(
    private readonly repository: UserRepository,
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

    if (params.userName !== undefined) {
      const userName = UserName.create(params.userName);

      if (params.userName !== user.toPrimitives().userName) {
        const exists = await this.repository.existsByUserName(
          tenant,
          userName,
          userId,
        );

        if (exists) {
          throw new UserNameAlreadyExistsException(params.userName);
        }
      }
    }

    if (params.email !== undefined && params.email !== null) {
      const email = UserEmail.create(params.email);

      if (params.email !== user.toPrimitives().email) {
        const exists = await this.repository.existsByEmail(
          tenant,
          email,
          userId,
        );

        if (exists) {
          throw new UserEmailAlreadyExistsException(email.value);
        }
      }
    }

    const updateParams: UserAggregateUpdateParams = {};

    if (params.userName !== undefined) {
      updateParams.userName = UserName.create(params.userName);
    }

    if (params.email !== undefined) {
      updateParams.email =
        params.email === null
          ? null
          : UserEmail.create(params.email);
    }

    if (params.firstName !== undefined) {
      updateParams.firstName = params.firstName;
    }

    if (params.secondName !== undefined) {
      updateParams.secondName = params.secondName;
    }

    if (params.firstLastName !== undefined) {
      updateParams.firstLastName = params.firstLastName;
    }

    if (params.secondLastName !== undefined) {
      updateParams.secondLastName = params.secondLastName;
    }

    if (params.birthDate !== undefined) {
      updateParams.age = UserBirthDate.create(params.birthDate);
    }

    if (params.sex !== undefined) {
      updateParams.sex = UserSex.create(params.sex);
    }

    if (params.phone !== undefined) {
      updateParams.phone = UserPhone.create(params.phone);
    }

    user.update(updateParams);

    await this.repository.update(tenant, user);
  }
}