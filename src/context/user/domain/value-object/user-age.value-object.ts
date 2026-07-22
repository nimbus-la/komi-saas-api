import { InvalidUserBirthDateException } from "../exceptions/user-exceptions";

export class UserAge {
  private constructor(public readonly value: Date) {}

  public static create(value: Date): UserAge {
    const today = new Date();

    if (value > today) {
      throw new InvalidUserBirthDateException(
        "porque no puede ser una fecha futura",
      );
    }

    return new UserAge(value);
  }

  public equals(other: UserAge): boolean {
    return this.value.getTime() === other.value.getTime();
  }
}
