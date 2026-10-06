import { registerAs } from "@nestjs/config";

import { CookieConfig } from "@/interfaces";
import { Enviroment } from "@/infrastructure/config/env.validation";


export default registerAs(
    'cookie',
    (): CookieConfig => {
        const env = process.env['NODE_ENV'];

        const allowsPlainHttp = env === Enviroment.Development || env === Enviroment.Test;

        return {
            // En desarrollo y en pruebas se sirve por http plano, y con secure el
            // navegador no guardaría ninguna cookie. En el resto de entornos solo
            // viajan por HTTPS.
            secure: !allowsPlainHttp,
        };
    }
);
