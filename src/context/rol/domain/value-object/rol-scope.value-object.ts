import { InvalidRolScopeException } from "../exceptions/rol.exceptions";
import { RolScopeEnum } from "../types";

export class RolScope {
  private constructor(public readonly value: RolScopeEnum) {}
  public static create(raw: string): RolScope {
    const scope = raw.toUpperCase() as RolScopeEnum;

    if (!Object.values(RolScopeEnum).includes(scope)) {
      throw new InvalidRolScopeException(raw);
    }

    return new RolScope(scope);
  }

  public isAdministrative(): boolean {
    return this.value === RolScopeEnum.ADMINISTRATIVE;
  }

  public isOperational(): boolean {
    return this.value === RolScopeEnum.OPERATIONAL;
  }
}
