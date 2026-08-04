import { UserRolScope } from "../../domain";

export abstract class RolFinder {
  abstract findScopeById(rolId: string): Promise<UserRolScope | null>;
}
