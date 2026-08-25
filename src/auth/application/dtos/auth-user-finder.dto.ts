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
    fullName: string;
    lastName: string;
    sex: string;
    passwordHash: string;
    isActive: boolean;
}