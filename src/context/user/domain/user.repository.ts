import { UserResponse } from "./types/user-response";
import { UserAggregate } from "./user.aggregate";
import { UserEmail, UserId, UserName } from "./value-object";

export abstract class UserRepository {
    abstract save(user: UserAggregate): Promise<void>;
    abstract update(user: UserAggregate): Promise<void>;
    abstract searchById(id: UserId): Promise<UserResponse | null>;
    abstract searchAggregateById(id: UserId,): Promise<UserAggregate | null>;
    abstract searchAll(): Promise<UserResponse[]>;
    abstract existsByEmail(email: UserEmail): Promise<boolean>;
    public abstract existsByUserName(userName: UserName,): Promise<boolean>;
};
