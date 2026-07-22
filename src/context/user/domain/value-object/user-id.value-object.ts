import { generateUUID, Uuid } from "@/shared";

export class UserId extends Uuid {
    private constructor(value: string) {
        super(value);
    };

    public static create(value:string): UserId {
        return new UserId(value);
    };

    public static generate(): UserId {
        return new UserId(generateUUID())
    }
    
}