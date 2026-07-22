import { InvalidUserSexException } from "../exceptions/user-exceptions";
import { UserSexEnum } from "../types";

export class UserSex {

    private constructor(
        public readonly value: UserSexEnum,
    ) {}

    public static create(value: string): UserSex {

        const sex = value.toUpperCase() as UserSexEnum;

        if (!Object.values(UserSexEnum).includes(sex)) {
            throw new InvalidUserSexException(`(${value})`);
        }

        return new UserSex(sex);
    }

    public equals(other: UserSex): boolean {
        return this.value === other.value;
    }
}