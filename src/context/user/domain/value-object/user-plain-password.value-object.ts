import { InvalidUserPasswordException } from "../exceptions/user-exceptions";

export class UserPlainPassword {
  private static readonly MIN_LENGTH = 12;
  private constructor(private readonly raw: string) {}

  public static create(raw: string): UserPlainPassword {
    if (raw.length < this.MIN_LENGTH) {
      throw new InvalidUserPasswordException(
        `debe tener mínimo ${this.MIN_LENGTH} caracteres`,
      );
    }
    
    if (!/[A-Z]/.test(raw)) {
      throw new InvalidUserPasswordException(
        "debe contener al menos una letra mayúscula",
      );
    }

    if (!/[a-z]/.test(raw)) {
      throw new InvalidUserPasswordException(
        "debe contener al menos una letra minúscula",
      );
    }

    if (!/[0-9]/.test(raw)) {
      throw new InvalidUserPasswordException(
        "debe contener al menos un número",
      );
    }

    return new UserPlainPassword(raw);
  }

  public expose(): string {
    return this.raw;
  }

  public toString(): string {
    return "[REDACTED]";
  }
}
