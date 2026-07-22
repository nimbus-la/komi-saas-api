import { Uuid } from "@/shared";

export class UserBranchId extends Uuid {

    private constructor(value: string) {
        super(value)
    };

    public static create(value: string): UserBranchId {
        return new UserBranchId(value);
    };
};