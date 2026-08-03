import { UserPlainPassword } from "../../domain";

export abstract class PasswordHasher {
    abstract hash(plain: UserPlainPassword): Promise<string>;
    abstract verify(plain: string, hashed: string): Promise<boolean>;
}