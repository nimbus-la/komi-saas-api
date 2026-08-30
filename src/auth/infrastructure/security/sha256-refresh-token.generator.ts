import { Injectable } from "@nestjs/common";
import { createHash, randomBytes } from "crypto";

import { GeneratedRefreshToken, RefreshTokenGenerator } from "../../application";


@Injectable()
export class Sha256RefreshTokenGenerator implements RefreshTokenGenerator {
    public generate(): GeneratedRefreshToken {
        const plain = randomBytes(32).toString('base64url');

        return {
            plain,
            hash: this.hash(plain)
        };
    }

    public hash(plain: string): string {
        return createHash('sha256').update(plain).digest('hex');
    }
}