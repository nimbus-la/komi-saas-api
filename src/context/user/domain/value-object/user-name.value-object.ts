import { InvalidUserNameException } from "../exceptions/user-exceptions";

export class UserName {
  private static readonly MIN_LENGTH = 3;
  private static readonly MAX_LENGTH = 30;
  private static readonly PATTERN = /^[a-zA-Z0-9._-]+$/;

  private constructor(public readonly value: string) {}

  public static create(raw: string): UserName {
    const value = raw.trim();

    if (value.length < this.MIN_LENGTH) {
      throw new InvalidUserNameException(
        `mínimo ${this.MIN_LENGTH} caracteres`,
      );
    }

    if (value.length > this.MAX_LENGTH) {
      throw new InvalidUserNameException(
        `máximo ${this.MAX_LENGTH} caracteres`,
      );
    }

    if (!this.PATTERN.test(value)) {
      throw new InvalidUserNameException(
        "solo puede contener letras, números, punto, guion y guion bajo",
      );
    }

    return new UserName(value);
  }

  public equals(other: UserName): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }
}
