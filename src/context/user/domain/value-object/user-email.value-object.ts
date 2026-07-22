import { InvalidUserEmailException } from "../exceptions/user-exceptions";

export class UserEmail {
  private static readonly MAX_LENGTH = 100;

  private constructor(public readonly value: string) {}

  public static create(raw: string): UserEmail {
    const value = raw.trim().toLowerCase();

    if (!value) {
      throw new InvalidUserEmailException("porque no puede estar vacío");
    }

    if (value.length > this.MAX_LENGTH) {
      throw new InvalidUserEmailException(
        `máximo ${this.MAX_LENGTH} caracteres`,
      );
    }

    return new UserEmail(value);
  }

  public equals(other: UserEmail): boolean {
    return this.value === other.value;
  }
}
