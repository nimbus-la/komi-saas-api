import { UserRolScope } from "../../domain";

export interface RolFinderResult {
  name: string;
  scope: UserRolScope;
}

export abstract class RolFinder {
  abstract findById(rolId: string): Promise<RolFinderResult | null>;
}