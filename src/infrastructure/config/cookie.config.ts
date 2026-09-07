import { registerAs } from "@nestjs/config";

import { CookieConfig } from "@/interfaces";
import { Enviroment } from "@/infrastructure/config/env.validation";


export default registerAs(
    'cookie',
    (): CookieConfig => {
        const env = process.env['NODE_ENV'];

        const allowsPlainHttp = env === Enviroment.Development || env === Enviroment.Test;

        const domain = process.env['COOKIE_DOMAIN']?.trim();

        return {
            secure: !allowsPlainHttp,
            domain: domain !== undefined && domain.length > 0 ? domain : undefined
        };
    }
);