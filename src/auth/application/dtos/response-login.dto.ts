/**
 * Lo que se le devuelve al cliente cuando el inicio de sesión sale bien.
 *
 * Es un recorte de AuthUserCredentials hecho a mano en el mapper: se quedan por
 * fuera el hash de la contraseña, el rolId y el flag isActive porque nadie del
 * otro lado los necesita y no tiene sentido exponerlos.
 */
export interface ResponseLoginDto {
    userId: string;
    tenantId: string;

    /** Sucursal asignada. Va en null cuando el usuario trabaja a nivel de todo el negocio. */
    branchId: string | null;

    rolName: string;
    
    /** Alcance del rol (por ejemplo BRANCH o TENANT). El front lo usa para pintar el menú. */
    rolScope: string;

    userName: string;
    firstName: string;
    secondName: string | null;
    firstLastName: string;
    secondLastName: string | null;
    sex: string;
}
