import { Uuid } from "@/shared";

export class UserTenantId extends Uuid {
  private constructor(value: string) {
    super(value);
  }

  public static create(value: string): UserTenantId {
    return new UserTenantId(value);
  }
}
