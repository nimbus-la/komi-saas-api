import { GeneratedRefreshToken } from "../dtos";

export abstract class RefreshTokenGenerator {
    abstract generate(): GeneratedRefreshToken;
    abstract hash(plain: string): string;
}