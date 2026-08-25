import { AuthUserCredentials } from "../dtos";

export abstract class AuthUserFinder {
    abstract findByUserName(
        tenantId: string,
        userName: string
    ): Promise<AuthUserCredentials | null>;
}