import { generateUUID, Uuid } from "@/shared";

export class SessionId extends Uuid {
    private constructor(value: string) {
        super(value);
    };

    public static create(value: string): SessionId {
        return new SessionId(value);
    };

    public static generate(): SessionId {
        return new SessionId(generateUUID());
    };
};