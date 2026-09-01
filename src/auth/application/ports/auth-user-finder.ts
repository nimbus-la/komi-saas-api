import { AuthUserCredentials } from "../dtos";

/**
 * Por dónde el login llega hasta el usuario que intenta entrar.
 *
 * Se declara como clase abstracta y no como interfaz porque Nest necesita algo
 * que exista en tiempo de ejecución para usarlo como token de inyección; la
 * implementación real vive en infraestructura.
 */
export abstract class AuthUserFinder {
    /**
     * Busca dentro del negocio indicado, nunca en toda la base. Devuelve null si
     * ahí no hay nadie con ese nombre, y también si el nombre viene con una forma
     * que el dominio no acepta, porque para el login ambos casos son lo mismo.
     *
     * La comparación respeta mayúsculas y minúsculas.
     */
    abstract findByUserName(
        tenantId: string,
        userName: string
    ): Promise<AuthUserCredentials | null>;

    abstract findByUserId(tenantId: string, userId: string): Promise<AuthUserCredentials | null>;
}
