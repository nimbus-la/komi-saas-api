import {
  UserAge,
  UserEmail,
  UserEmailAlreadyExistsException,
  UserFullName,
  UserId,
  UserLastName,
  UserName,
  UserNameAlreadyExistsException,
  UserNotFoundException,
  UserPassword,
  UserPhone,
  UserRepository,
  UserSex,
} from "@/context/user/domain";

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
  constructor(private readonly repository: UserRepository) {}

  public async execute(id: string, params: UpdateUserParams): Promise<void> {
    const user = await this.repository.searchAggregateById(UserId.create(id));

    if (user === null) {
      throw new UserNotFoundException(id);
    }

    let userName: UserName | undefined;
    let email: UserEmail | undefined;

    if (params.userName !== undefined) {
      userName = UserName.create(params.userName);

      if (await this.repository.existsByUserName(userName)) {
        throw new UserNameAlreadyExistsException(params.userName);
      }
    }

    if (params.email !== undefined) {
      email = UserEmail.create(params.email);

      if (await this.repository.existsByEmail(email)) {
        throw new UserEmailAlreadyExistsException(params.email);
      }
    }

    user.update({
      ...(userName ? { userName } : {}),
      ...(email ? { email } : {}),
      ...(params.password !== undefined
        ? { password: UserPassword.create(params.password) }
        : {}),
      ...(params.fullName !== undefined
        ? { fullName: UserFullName.create(params.fullName) }
        : {}),
      ...(params.lastName !== undefined
        ? { lastName: UserLastName.create(params.lastName) }
        : {}),
      ...(params.age !== undefined ? { age: UserAge.create(params.age) } : {}),
      ...(params.sex !== undefined ? { sex: UserSex.create(params.sex) } : {}),
      ...(params.phone !== undefined
        ? { phone: UserPhone.create(params.phone) }
        : {}),
    });

    await this.repository.update(user);
  }
}
