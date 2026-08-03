import { InvalidUserPhoneException } from "../exceptions/user-exceptions";

export class UserPhone {
  private static readonly MIN_LENGTH = 7;
  private static readonly MAX_LENGTH = 15;
  private static readonly PATTERN = /^[0-9+\-\s()]+$/;

  private constructor(public readonly value: string) {}

  public static create(raw: string): UserPhone {
    const value = raw.trim();

    if (value.length < this.MIN_LENGTH) {
      throw new InvalidUserPhoneException(
        `mínimo ${this.MIN_LENGTH} caracteres`,
      );
    }

    if (value.length > this.MAX_LENGTH) {
      throw new InvalidUserPhoneException(
        `máximo ${this.MAX_LENGTH} caracteres`,
      );
    }

    if (!this.PATTERN.test(value)) {
      throw new InvalidUserPhoneException("contiene caracteres no válidos");
    }

    return new UserPhone(value);
  }

  public equals(other: UserPhone): boolean {
    return this.value === other.value;
  }
}
