import { InvalidUserLastNameException } from "../exceptions/user-exceptions";

export class UserLastName {
  private static readonly MIN_LENGTH = 2;
  private static readonly MAX_LENGTH = 50;

  private constructor(public readonly value: string) {}

  public static create(raw: string): UserLastName {
    const value = raw.trim();

    if (value.length < this.MIN_LENGTH) {
      throw new InvalidUserLastNameException(
        `mínimo ${this.MIN_LENGTH} caracteres`,
      );
    }

    if (value.length > this.MAX_LENGTH) {
      throw new InvalidUserLastNameException(
        `máximo ${this.MAX_LENGTH} caracteres`,
      );
    }

    return new UserLastName(value);
  }

  public equals(other: UserLastName): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }
}
