import { InactiveAccountException, InactiveTenantException, InvalidCredentialsException } from "../../../domain";

import { LoginParams, SessionContext } from "../../dtos";
import { toAuthTokensResponse, toUserResponse } from "../../mappers";
import { AuthUserFinder, PasswordVerifier, TenantResolver } from "../../ports";
import { SessionIssuer } from "../../services/session-issuer";

/**
 * Inicio de sesión de un usuario dentro de un negocio.
 *
 * El orden de los pasos no es casual: se resuelve el negocio, se busca al usuario
 * dentro de él, se verifica la contraseña, y SOLO ENTONCES se mira si el negocio
 * o la cuenta están dados de baja.
 *
 * Todo lo que ocurre antes de verificar la contraseña responde siempre lo mismo
 * —credenciales inválidas— y tarda siempre lo mismo. Distinguir antes de ese
 * punto entre "ese negocio no existe", "ese usuario no existe" y "la contraseña
 * está mal" convierte el login en un buscador: probando slugs se averigua qué
 * negocios hay dados de alta, y probando nombres, quién trabaja en ellos.
 *
 * Es una clase suelta, sin decoradores de Nest, para poder probarla con los
 * puertos falseados; el módulo la arma con una factory.
 */
export class LoginUseCase {
    constructor(
        private readonly tenantResolver: TenantResolver,
        private readonly userFinder: AuthUserFinder,
        private readonly passwordVerifier: PasswordVerifier,
        private readonly sessionIssuer: SessionIssuer,
    ) { }


    public async execute(params: LoginParams, context: SessionContext) {
        // Los slugs se guardan en minúsculas, así que aquí se acomoda lo que
        // escribió el usuario en vez de rechazarlo por una mayúscula de más.
        const tenantSlug = params.tenantSlug.trim().toLowerCase();

        const tenant = await this.tenantResolver.findBySlug(tenantSlug);

        if (tenant === null) {
            // Se responde exactamente igual que ante una contraseña incorrecta, y
            // se gasta el mismo tiempo. Decir "ese negocio no existe" —o contestar
            // al instante, que viene a ser lo mismo— convertía el login en un
            // buscador de clientes: probando slugs se sabía cuáles están dados de
            // alta en la plataforma.
            await this.passwordVerifier.verifyAgainstDummy(params.password);
            throw new InvalidCredentialsException(tenantSlug, params.username.trim());
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

        // Recién ahora, con la identidad ya probada, tiene sentido contar por qué no
        // puede entrar. Antes de este punto cualquiera de estos dos mensajes le
        // estaría confirmando a un desconocido que el negocio existe o que el
        // usuario existe; después, se los está dando a su dueño.
        //
        // El del negocio va primero porque es el motivo que manda: si está dado de
        // baja, da igual en qué estado esté la cuenta.
        if (!tenant.isActive) {
            throw new InactiveTenantException(tenantSlug);
        }

        if (!dataUser.isActive) {
            throw new InactiveAccountException(identifier);
        }

        // Abrir la sesión y firmar los tokens es lo mismo aquí que al renovar, así
        // que lo hace el emisor compartido y no cada caso de uso por su cuenta.
        const tokens = await this.sessionIssuer.start(dataUser, context);

        return {
            // Y la forma de la respuesta sale del mapper que también comparten: los
            // dos endpoints devuelven exactamente los mismos campos.
            ...toAuthTokensResponse(tokens),
            lastLogin: "",
            user: toUserResponse(dataUser)
        }
    }
}
