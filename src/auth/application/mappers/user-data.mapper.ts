import { AuthUserCredentials, ResponseLoginDto } from "../dtos";

export const toUserResponse = (user: AuthUserCredentials): ResponseLoginDto => {
    const { tenantId, branchId, userId, rolScope, userName, firstName, secondName, firstLastName, secondLastName, sex } = user;

    return {
        tenantId,
        branchId,
        userId,
        rolScope,
        userName,
        firstName,
        secondName,
        firstLastName,
        secondLastName,
        sex,
    };
}