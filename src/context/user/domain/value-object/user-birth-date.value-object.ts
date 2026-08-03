import { InvalidUserBirthDateException } from "../exceptions/user-exceptions";

export class UserBirthDate {
  private constructor(public readonly value: Date) {}

  public static create(raw: Date | string): UserBirthDate {
    const value = raw instanceof Date ? raw : new Date(raw);

    if (Number.isNaN(value.getTime())) {
      throw new InvalidUserBirthDateException(
        "la fecha de nacimiento no es válida",
      );
    }

    const today = new Date();

    if (value > today) {
      throw new InvalidUserBirthDateException(
        "la fecha de nacimiento no puede ser futura",
      );
    }

    return new UserBirthDate(value);
  }

  public equals(other: UserBirthDate): boolean {
    return this.value.getTime() === other.value.getTime();
  }
}
