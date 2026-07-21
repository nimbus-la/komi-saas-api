import { InvalidRolCodeException } from "../exceptions/rol.exceptions";

export class RolCode {
  private static readonly MIN_LENGTH = 2;
  private static readonly MAX_LENGTH = 20;

  private constructor(public readonly value: string) {}

  public static create(raw: string): RolCode {
    const value = raw.trim();

    if (value.length < this.MIN_LENGTH) {
      throw new InvalidRolCodeException(`mínimo ${this.MIN_LENGTH} caracteres`);
    }

    if (value.length > this.MAX_LENGTH) {
      throw new InvalidRolCodeException(`máximo ${this.MAX_LENGTH} caracteres`);
    }

    return new RolCode(value);
  }

  public equals(other: RolCode): boolean {
    return this.value.toUpperCase() === other.value.toUpperCase();
  }
}
