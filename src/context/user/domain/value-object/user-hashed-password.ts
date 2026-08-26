import { InvalidUserPasswordException } from "../exceptions/user-exceptions";

export class UserHashedPassword {
  private constructor(public readonly value: string) {}

  /**
   * Solo argon2. Antes esto también dejaba pasar hashes de bcrypt ($2...), pero
   * aquí no hay nada que sepa verificarlos: ese usuario nunca iba a poder entrar
   * y encima el error le salía como si se hubiera equivocado de contraseña.
   */
  public static fromHash(hash: string): UserHashedPassword {
    if (!hash?.startsWith("$argon2")) {
      throw new InvalidUserPasswordException("el valor no es un hash argon2 válido");
    }

    return new UserHashedPassword(hash);
  }
}
