import { Controller, Post } from "@nestjs/common";

import { Public } from "@/auth/infrastructure/decorators/public.decorator";
import { ResponseMessage } from "@/infrastructure";

import { RunSeedUseCase } from "../../application/use-cases/run-seed/run-seed.use-case";


/**
 * Solo se registra con NODE_ENV=development (ver AppModule). En cualquier otro
 * entorno la ruta no existe.
 */
@Controller("seed")
export class SeedController {
    constructor(
        private readonly runSeedUseCase: RunSeedUseCase,
    ) { }


    // Pública porque en una base vacía todavía no hay usuario con el que iniciar sesión.
    @Public()
    @Post()
    @ResponseMessage("Datos de prueba creados exitosamente")
    public async run() {
        return this.runSeedUseCase.execute();
    }
}
