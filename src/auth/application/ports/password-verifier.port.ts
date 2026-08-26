/**
 * Compara contraseñas sin que la aplicación sepa con qué algoritmo se hicieron
 * los hashes. Hoy es argon2 y mañana puede ser otro, y por aquí no se nota.
 */
export abstract class PasswordVerifier {
    /**
     * Compara la contraseña en texto plano contra el hash guardado. Un hash
     * corrupto o ilegible cuenta como que no coincide, no como un error.
     */
    abstract verify(plain: string, hash: string): Promise<boolean>;

    /**
     * Verificación contra un hash falso. Se llama cuando el usuario NO existe
     * para que la respuesta tarde lo mismo que cuando sí existe. El tiempo de
     * respuesta delata qué usuarios están registrados.
     * 
     * @param plain 
     */
    abstract verifyAgainstDummy(plain: string): Promise<void>;
}
