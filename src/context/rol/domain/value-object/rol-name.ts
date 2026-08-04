import { InvalidRolNameException } from "../exceptions/rol.exceptions";

export class RolName {
  private static readonly MIN_LENGTH = 2;
  private static readonly MAX_LENGTH = 50;

  private constructor(public readonly value: string) {}

  public static create(raw: string): RolName {
    const value = raw.trim();

    if (value.length < this.MIN_LENGTH) {
      throw new InvalidRolNameException(`mínimo ${this.MIN_LENGTH} caracteres`);
    }

    if (value.length > this.MAX_LENGTH) {
      throw new InvalidRolNameException(`máximo ${this.MAX_LENGTH} caracteres`);
    }

    return new RolName(value);
  }

  public equals(other: RolName): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }
}
