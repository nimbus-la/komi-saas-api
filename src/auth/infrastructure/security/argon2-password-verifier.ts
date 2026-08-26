import * as argon2 from "argon2";
import { randomBytes } from "crypto";
import { Injectable, Logger } from "@nestjs/common";

import { PasswordVerifier } from "../../application";

/**
 * Verificador de contraseñas con argon2, el mismo algoritmo con el que se
 * guardan al crear un usuario.
 *
 * Los parámetros de verificación no se configuran aquí: argon2 los lee del propio
 * hash, así que contraseñas guardadas con distinta configuración siguen
 * funcionando sin tocar nada.
 */
@Injectable()
export class Argon2PasswordVerifier implements PasswordVerifier {
    private readonly logger = new Logger(Argon2PasswordVerifier.name);

    /**
     * Se calcula en el primer login, no en el constructor. Creándolo al arrancar
     * queda una promesa suelta que nadie espera hasta mucho después, y si argon2
     * falla Node se lleva puesto el proceso con un unhandled rejection.
     */
    private dummyHash: Promise<string> | null = null;


    public async verify(plain: string, hash: string): Promise<boolean> {
        try {
            return await argon2.verify(hash, plain);
        } catch {
            // Un hash corrupto o con formato desconocido es un fallo de credenciales.
            return false;
        }
    }


    /**
     * Compara contra un hash de mentira solo para gastar el mismo tiempo que una
     * verificación de verdad. Nunca lanza: si argon2 se cae, el login igual tiene
     * que terminar respondiendo que las credenciales son inválidas.
     */
    public async verifyAgainstDummy(plain: string): Promise<void> {
        try {
            await argon2.verify(await this.getDummyHash(), plain);
        } catch {
            // El resultado se descarta siempre; lo único que importa es el tiempo.
        }
    }


    /**
     * Guardamos el hash para no recalcularlo en cada login, pero si falla lo
     * limpiamos en vez de dejar ahí la promesa rechazada. Si no, un tropiezo
     * puntual (argon2 pide 64MB y no siempre los consigue) bastaría para que este
     * método respondiera al instante durante toda la vida del proceso.
     */
    private getDummyHash(): Promise<string> {
        if (this.dummyHash === null) {
            this.dummyHash = argon2
                // El contenido da igual, nadie lo va a adivinar ni le hace falta:
                // lo único que se busca es un hash válido contra el cual gastar tiempo.
                .hash(randomBytes(32).toString("hex"), { type: argon2.argon2id })
                .catch((error: unknown) => {
                    this.dummyHash = null;
                    this.logger.error("No se pudo calcular el hash dummy de argon2", error);

                    throw error;
                });
        }

        return this.dummyHash;
    }
}
