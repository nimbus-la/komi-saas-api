/**
 * Vista mínima del usuario que necesita el login. Incluye el hash de la
 * contraseña que NO debe salir nunca de la capa de aplicación.
 */
export interface AuthUserCredentials {
    userId: string;
    tenantId: string;
    branchId: string | null;
    rolId: string;
    rolScope: string;
    userName: string;
    firstName: string;
    secondName: string | null;
    firstLastName: string;
    secondLastName: string | null;
    sex: string;
    passwordHash: string;
    isActive: boolean;
}