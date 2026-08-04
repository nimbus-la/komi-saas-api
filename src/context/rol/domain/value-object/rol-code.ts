import { InvalidRolCodeException } from "../exceptions/rol.exceptions";
import { RolCodeEnum } from "../types";

export class RolCode {
  private constructor(public readonly value: RolCodeEnum) {}

  public static create(raw: string): RolCode {
    const value = raw.trim().toUpperCase();

    if (!Object.values(RolCodeEnum).includes(value as RolCodeEnum)) {
      throw new InvalidRolCodeException(
        `"${raw}" no es un código de rol conocido`,
      );
    }
    return new RolCode(value as RolCodeEnum);
  }

  public equals(other: RolCode): boolean {
    return this.value === other.value;
  }
}
