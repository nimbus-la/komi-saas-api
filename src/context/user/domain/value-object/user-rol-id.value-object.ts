import { Uuid } from "@/shared";

export class UserRolId extends Uuid {

    private constructor(value: string) {
        super(value);
    }

    public static create(value: string): UserRolId {
        return new UserRolId(value);
    }
}