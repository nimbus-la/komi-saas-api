import { AuthUserCredentials, ResponseLoginDto } from "../dtos";

/**
 * Recorta el usuario a lo que sí puede salir por la API.
 *
 * Se hace campo por campo a propósito, nada de esparcir el objeto y borrar lo que
 * sobra. Si mañana AuthUserCredentials gana un dato sensible, con este armado no
 * se cuela solo en la respuesta: hay que venir a agregarlo aquí.
 */
export const toUserResponse = (user: AuthUserCredentials): ResponseLoginDto => {
    const { tenantId, branchId, userId, rolName, rolScope, userName, firstName, secondName, firstLastName, secondLastName, sex } = user;

    return {
        tenantId,
        branchId,
        userId,
        rolName,
        rolScope,
        userName,
        firstName,
        secondName,
        firstLastName,
        secondLastName,
        sex,
    };
}
