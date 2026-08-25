import { InvalidCredentialsException } from "../../../domain";

import { LoginParams } from "../../dtos";
import { AuthUserFinder } from "../../ports";

export class LoginUseCase {
    constructor(
        private readonly userFinder: AuthUserFinder
    ) { }


    public async execute(params: LoginParams) {
        /**
         * TODO: Realizar los siguientes pasos de validacion:
         * *1. Validar que el tenantId exita y este activo.
         * *2. Validar que el usuario exita, username/correo y contraseña
         * *3. Guardar el registro de inicio de sesion en la base de datos
         */

        const dataUser = await this.userFinder.findByUserName("019ff7ac-76bf-76ac-891e-ac1fc352d13e", params.username);

        if (!dataUser) {
            throw new InvalidCredentialsException()
        }
        
        console.log("datos del usuario: ", dataUser)
        console.log("params: ", params)

        return dataUser;
    }
}