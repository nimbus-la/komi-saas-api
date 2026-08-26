import { AuthTenantNotFoundException, InactiveAccountException, InactiveTenantException, InvalidCredentialsException } from "../../../domain";

import { LoginParams } from "../../dtos";
import { AuthUserFinder, PasswordVerifier, TenantResolver } from "../../ports";

export class LoginUseCase {
    constructor(
        private readonly tenantResolver: TenantResolver,
        private readonly userFinder: AuthUserFinder,
        private readonly passwordVerifier: PasswordVerifier
    ) { }


    public async execute(params: LoginParams) {
        /**
         * TODO: Realizar los siguientes pasos de validacion:
         * *1. Validar que el tenantId exita y este activo.
         * *2. Validar que el usuario exita, username/correo y contraseña
         * *3. Guardar el registro de inicio de sesion en la base de datos
         */

        const tenantSlug = params.tenantSlug.trim().toLowerCase();

        const tenant = await this.tenantResolver.findBySlug(tenantSlug);

        if (tenant === null) {
            throw new AuthTenantNotFoundException(tenantSlug);
        }

        if (!tenant.isActive) {
            throw new InactiveTenantException(tenantSlug);
        }

        const identifier = params.username.trim();

        const dataUser = await this.userFinder.findByUserName(tenant.id, identifier);

        if (dataUser === null) {
            await this.passwordVerifier.verifyAgainstDummy(params.password);
            throw new InvalidCredentialsException(tenantSlug, identifier);
        }

        const passwordMatches = await this.passwordVerifier.verify(
            params.password,
            dataUser.passwordHash
        );

        if (!passwordMatches) {
            throw new InvalidCredentialsException(tenantSlug, identifier);
        }

        if (!dataUser.isActive) {
            throw new InactiveAccountException(identifier);
        }

        console.log("datos del usuario: ", dataUser)
        console.log("params: ", params)

        return dataUser;
    }
}