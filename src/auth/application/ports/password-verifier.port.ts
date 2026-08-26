export abstract class PasswordVerifier {
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