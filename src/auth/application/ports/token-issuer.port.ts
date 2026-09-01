import { IssuedToken, SessionClaims } from "../dtos";

export abstract class TokenIssuer {
    abstract issue(claims: SessionClaims): Promise<IssuedToken>;
}