/**
 * Vista mínima del usuario que necesita el login. Incluye el hash de la
 * contraseña que NO debe salir nunca de la capa de aplicación.
 *
 * Es una copia plana del agregado de usuario, no el agregado en sí. El módulo de
 * auth se queda solo con lo que usa para autenticar y así no queda amarrado a
 * cómo esté armado el dominio de usuarios por dentro.
 */
export interface AuthUserCredentials {
    userId: string;

    /** Negocio al que pertenece. Sirve para confirmar que se buscó donde tocaba. */
    tenantId: string;

    /** Sucursal asignada, o null si el usuario no está atado a una sola sede. */
    branchId: string | null;

    rolId: string;

    /** Alcance del rol. Es lo único del rol que viaja hasta la respuesta. */
    rolScope: string;

    userName: string;
    firstName: string;
    secondName: string | null;
    firstLastName: string;
    secondLastName: string | null;
    sex: string;

    /** Hash argon2 guardado en la base. Se compara y se descarta, jamás se devuelve. */
    passwordHash: string;

    /** Una cuenta inactiva tiene credenciales válidas pero no puede entrar. */
    isActive: boolean;
}
