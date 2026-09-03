import { generateUUID, Uuid } from "@/shared";

export class MenuId extends Uuid {
    private constructor(value: string) {
        super(value);
    }

    public static create(value: string): MenuId {
        return new MenuId(value);
    }

    public static generate(): MenuId {
        return new MenuId(generateUUID());
    }
}
