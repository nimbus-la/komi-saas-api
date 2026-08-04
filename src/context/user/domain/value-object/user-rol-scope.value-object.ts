import { InvalidRolScopeException } from "@/context/rol/domain";
import { UserRolScopeEnum } from "../types";

export class UserRolScope {
  private constructor(
    public readonly value: UserRolScopeEnum,
  ) {}

  public static create(raw: string): UserRolScope {
    const scope = raw.toUpperCase() as UserRolScopeEnum;

    if (!Object.values(UserRolScopeEnum).includes(scope)) {
      throw new InvalidRolScopeException(raw);
    }

    return new UserRolScope(scope);
  }

  public isAdministrative(): boolean {
    return this.value === UserRolScopeEnum.ADMINISTRATIVE;
  }

  public isOperational(): boolean {
    return this.value === UserRolScopeEnum.OPERATIONAL;
  }
}