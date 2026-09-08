import { registerAs } from "@nestjs/config";

import { CookieConfig, CookieSameSite } from "@/interfaces";
import { Enviroment } from "@/infrastructure/config/env.validation";


/**
 * El valor por defecto y el único que conviene a largo plazo: sirve en cuanto
 * el front y la API cuelgan del mismo dominio, y es el que trata la cookie como
 * de primera parte en TODOS los navegadores.
 */
const DEFAULT_SAME_SITE: CookieSameSite = 'lax';


/**
 * `env.validation` ya rechaza cualquier valor que no sea uno de los tres, así
 * que aquí solo queda resolver la ausencia de la variable.
 */
const parseSameSite = (raw: string | undefined): CookieSameSite => {
    switch (raw?.trim()) {
        case 'strict': return 'strict';
        case 'none': return 'none';
        default: return DEFAULT_SAME_SITE;
    }
};


export default registerAs(
    'cookie',
    (): CookieConfig => {
        const env = process.env['NODE_ENV'];

        const allowsPlainHttp = env === Enviroment.Development || env === Enviroment.Test;

        const domain = process.env['COOKIE_DOMAIN']?.trim();

        const sameSite = parseSameSite(process.env['COOKIE_SAME_SITE']);

        return {
            /**
             * `none` obliga a `secure` y no es una opinión: el navegador descarta
             * sin avisar toda cookie SameSite=None que no venga marcada como
             * segura. Forzarlo aquí evita una combinación que no existe; dejarla
             * pasar daría una cookie que nunca se guarda y ningún error que lo
             * explique.
             *
             * Fuera de ese caso manda el entorno: en desarrollo se sirve por http
             * plano y con `secure` el navegador no guardaría nada.
             */
            secure: sameSite === 'none' ? true : !allowsPlainHttp,
            sameSite,
            domain: domain !== undefined && domain.length > 0 ? domain : undefined
        };
    }
);
