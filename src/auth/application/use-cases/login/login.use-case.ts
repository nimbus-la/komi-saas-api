import { LoginParams } from "../../dtos/login.dto";

export class LoginUseCase {
    constructor() { }

    public async execute(params: LoginParams) {
        /**
         * TODO: Realizar los siguientes pasos de validacion:
         * *1. Validar que el tenantId exita y este activo.
         * *2. Validar que el usuario exita, username/correo y contraseña
         * *3. Guardar el registro de inicio de sesion en la base de datos
         */
        console.log("params: ", params)
    }
}