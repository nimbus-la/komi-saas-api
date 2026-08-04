import { InvalidUserEmailException } from "../exceptions/user-exceptions";

export class UserEmail {
  private static readonly MAX_LENGTH = 120;
  private static readonly PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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

    if (!this.PATTERN.test(value)) {
      throw new InvalidUserEmailException("porque no tiene un formato válido");
    }
    return new UserEmail(value);
  }

  public equals(other: UserEmail): boolean {
    return this.value === other.value;
  }
}
