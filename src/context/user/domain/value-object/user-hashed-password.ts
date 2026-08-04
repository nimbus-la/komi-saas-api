import { InvalidUserPasswordException } from "../exceptions/user-exceptions";

export class UserHashedPassword {
  private constructor(public readonly value: string) {}

  public static fromHash(hash: string): UserHashedPassword {
    if (!hash?.startsWith("$argon2") && !hash?.startsWith("$2")) {
      throw new InvalidUserPasswordException("el valor no es un hash válido");
    }

    return new UserHashedPassword(hash);
  }
}
