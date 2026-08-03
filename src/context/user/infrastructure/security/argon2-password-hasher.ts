import * as argon2 from 'argon2';
import { Injectable } from "@nestjs/common";
import { PasswordHasher } from "../../application";
import { UserPlainPassword } from "../../domain";

@Injectable()
export class Argon2PasswordHasher implements PasswordHasher {
  public async hash(plain: UserPlainPassword): Promise<string> {
    return await argon2.hash(plain.expose(), { type: argon2.argon2id });
  }

  public async verify(plain:string, hashed:string):Promise<boolean> {
    return await argon2.verify(hashed, plain);
  }
}
