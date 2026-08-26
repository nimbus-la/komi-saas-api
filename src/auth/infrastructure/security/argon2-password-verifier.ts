import * as argon2 from "argon2";
import { randomBytes } from "crypto";

import { PasswordVerifier } from "../../application";

export class Argon2PasswordVerifier implements PasswordVerifier {
    private readonly dummyHash: Promise<string>;


    constructor() {
        this.dummyHash = argon2.hash(randomBytes(32).toString("hex"), {
            type: argon2.argon2id
        });
    }


    public async verify(plain: string, hash: string): Promise<boolean> {
        try {
            return await argon2.verify(hash, plain);
        } catch {
            // Un hash corrupto o con formato desconocido es un fallo de credenciales.
            return false;
        }
    }


    public async verifyAgainstDummy(plain: string): Promise<void> {
        try {
            await argon2.verify(await this.dummyHash, plain);
        } catch (error) {
            // El resultado se descarta siempre; lo único que importa es el tiempo.
        }
    }
}