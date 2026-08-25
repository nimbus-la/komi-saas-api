import { UserResponse } from "./types/user-response";
import { UserAggregate } from "./user.aggregate";
import { UserEmail, UserId, UserName, UserTenantId } from "./value-object";

export abstract class UserRepository {
  abstract save(user: UserAggregate): Promise<void>;
  abstract update(user: UserAggregate): Promise<void>;
  abstract searchById(id: UserId): Promise<UserResponse | null>;
  abstract searchAggregateById(id: UserId): Promise<UserAggregate | null>;
  abstract searchAggregateByUserName(
  tenantId: UserTenantId,
  userName: UserName,
): Promise<UserAggregate | null>;
  abstract searchAll(): Promise<UserResponse[]>;
  abstract existsByUserName(
    tenantId: UserTenantId,
    userName: UserName,
    exceptId?: UserId,
  ): Promise<boolean>;
  abstract existsByEmail(
    tenantId: UserTenantId,
    email: UserEmail,
    exceptId?: UserId,
  ): Promise<boolean>;
};
