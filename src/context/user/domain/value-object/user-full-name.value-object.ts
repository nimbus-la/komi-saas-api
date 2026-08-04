import { InvalidUserFullNameException } from "../exceptions/user-exceptions";

export class UserFullName {
  private static readonly MIN_LENGTH = 2;
  private static readonly MAX_LENGTH = 50;

  private constructor(public readonly value: string) {}

  public static create(raw: string): UserFullName {
    const value = raw.trim();

    if (value.length < this.MIN_LENGTH) {
      throw new InvalidUserFullNameException(
        `mínimo ${this.MIN_LENGTH} caracteres`,
      );
    };

    if (value.length > this.MAX_LENGTH) {
      throw new InvalidUserFullNameException(
        `máximo ${this.MAX_LENGTH} caracteres`,
      );
    };

    return new UserFullName(value);
  };

  public equals(other: UserFullName): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  };
};
