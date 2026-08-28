import { generateUUID } from "@/shared";
import { AuthTenantNotFoundException, InactiveAccountException, InactiveTenantException, InvalidCredentialsException } from "../../../domain";

import { LoginParams } from "../../dtos";
import { toUserResponse } from "../../mappers";
import { AuthUserFinder, PasswordVerifier, TenantResolver, TokenIssuer } from "../../ports";

/**
 * Inicio de sesión de un usuario dentro de un negocio.
 *
 * El orden de los pasos no es casual, primero se resuelve el negocio, después se
 * busca al usuario dentro de ese negocio, luego se verifica la contraseña y solo
 * al final se mira si la cuenta está activa. Contar que una cuenta existe pero
 * está inactiva antes de comprobar la contraseña le regalaría esa información a
 * cualquiera que pruebe nombres al azar.
 *
 * Es una clase suelta, sin decoradores de Nest, para poder probarla con los tres
 * puertos falseados; el módulo la arma con una factory.
 */
export class LoginUseCase {
    constructor(
        private readonly tenantResolver: TenantResolver,
        private readonly userFinder: AuthUserFinder,
        private readonly passwordVerifier: PasswordVerifier,
        private readonly tokenIssuer: TokenIssuer
    ) { }


    public async execute(params: LoginParams) {
        // Los slugs se guardan en minúsculas, así que aquí se acomoda lo que
        // escribió el usuario en vez de rechazarlo por una mayúscula de más.
        const tenantSlug = params.tenantSlug.trim().toLowerCase();

        const tenant = await this.tenantResolver.findBySlug(tenantSlug);

        if (tenant === null) {
            throw new AuthTenantNotFoundException(tenantSlug);
        }

        if (!tenant.isActive) {
            throw new InactiveTenantException(tenantSlug);
        }

        // Al username solo se le quitan los espacios de los bordes. Las mayúsculas
        // se respetan porque la búsqueda es sensible a caso.
        const identifier = params.username.trim();

        // Se busca con el id del negocio, no con el slug, para que dos negocios
        // puedan tener un "admin" cada uno sin pisarse.
        const dataUser = await this.userFinder.findByUserName(tenant.id, identifier);

        if (dataUser === null) {
            // No hay hash contra el cual comparar, pero igual se quema el tiempo de
            // un argon2 real. Si esta rama respondiera al instante, medir cuánto
            // tarda el login sería suficiente para saber qué usuarios existen.
            await this.passwordVerifier.verifyAgainstDummy(params.password);
            throw new InvalidCredentialsException(tenantSlug, identifier);
        }

        // La contraseña va tal cual llegó, sin trim: los espacios pueden ser parte
        // de ella y recortarlos cambiaría lo que el usuario realmente escribió.
        const passwordMatches = await this.passwordVerifier.verify(
            params.password,
            dataUser.passwordHash
        );

        if (!passwordMatches) {
            throw new InvalidCredentialsException(tenantSlug, identifier);
        }

        // Recién ahora, con la identidad ya probada, tiene sentido decirle que su
        // cuenta está deshabilitada.
        if (!dataUser.isActive) {
            throw new InactiveAccountException(identifier);
        }

        const sessionId = generateUUID();

        const issued = await this.tokenIssuer.issue({
            userId: dataUser.userId,
            tenantId: dataUser.tenantId,
            branchId: dataUser.branchId,
            rolScope: dataUser.rolScope,
            sessionId
        });

        return {
            // Pendientes: van vacíos hasta que se implemente la emisión del token
            // de sesión y el registro del último ingreso.
            sessionToken: issued.accessToken,
            expiredAt: issued.expiresAt.toISOString(),
            lastLogin: "",
            user: toUserResponse(dataUser)
        }
    }
}
