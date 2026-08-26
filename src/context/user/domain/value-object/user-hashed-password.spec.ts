import { InvalidUserPasswordException } from '../exceptions/user-exceptions';
import { UserHashedPassword } from './user-hashed-password';


const ARGON2_HASH = '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$hash-de-prueba';


describe('UserHashedPassword', () => {
    it('acepta un hash argon2id', () => {
        expect(UserHashedPassword.fromHash(ARGON2_HASH).value).toBe(ARGON2_HASH);
    });


    it('acepta las demás variantes de argon2', () => {
        expect(() => UserHashedPassword.fromHash('$argon2i$v=19$m=4096,t=3,p=1$c2FsdA$abc')).not.toThrow();
        expect(() => UserHashedPassword.fromHash('$argon2d$v=19$m=4096,t=3,p=1$c2FsdA$abc')).not.toThrow();
    });


    /**
     * Estos hashes antes pasaban sin chistar y el problema aparecía mucho después:
     * argon2.verify tiraba error, el verifier lo devolvía como false y el usuario
     * se quedaba con "credenciales inválidas" sin que nadie supiera por qué.
     */
    describe('hashes bcrypt', () => {
        it.each([
            ['$2a$', '$2a$12$KIXQJmVQnZ8yQ7Z8yQ7Z8uKIXQJmVQnZ8yQ7Z8yQ7Z8yQ7Z8yQ7Z8'],
            ['$2b$', '$2b$12$KIXQJmVQnZ8yQ7Z8yQ7Z8uKIXQJmVQnZ8yQ7Z8yQ7Z8yQ7Z8yQ7Z8'],
            ['$2y$', '$2y$12$KIXQJmVQnZ8yQ7Z8yQ7Z8uKIXQJmVQnZ8yQ7Z8yQ7Z8yQ7Z8yQ7Z8'],
        ])('rechaza el formato %s en lugar de aceptarlo como válido', (_prefix, hash) => {
            expect(() => UserHashedPassword.fromHash(hash)).toThrow(InvalidUserPasswordException);
        });
    });


    it('rechaza una contraseña en texto plano', () => {
        expect(() => UserHashedPassword.fromHash('Sup3rSecreta')).toThrow(
            InvalidUserPasswordException,
        );
    });


    it('rechaza una cadena vacía', () => {
        expect(() => UserHashedPassword.fromHash('')).toThrow(InvalidUserPasswordException);
    });


    it('rechaza null o undefined llegados desde la BD sin reventar con TypeError', () => {
        expect(() => UserHashedPassword.fromHash(null as unknown as string)).toThrow(
            InvalidUserPasswordException,
        );
        expect(() => UserHashedPassword.fromHash(undefined as unknown as string)).toThrow(
            InvalidUserPasswordException,
        );
    });
});
