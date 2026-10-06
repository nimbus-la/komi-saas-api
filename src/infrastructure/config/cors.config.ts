import { registerAs } from "@nestjs/config";
import { CorsConfig } from "@/interfaces";
import { Enviroment } from "./env.validation";


/**
 * Configuración tipada bajo el namespace 'cors'.
 * CORS_ORIGINS es una lista separada por comas:
 *   CORS_ORIGINS=http://localhost:3000,https://app.komi.com
 */

/**
 * Deja el origen en la misma forma en la que el navegador envía el header
 * `Origin`: minúsculas y sin barra final. Sin esto, un `CORS_ORIGINS`
 * escrito como 'https://App.Komi.com/' bloquea TODO en silencio.
 *
 * Solo se normaliza la whitelist (dato de confianza), nunca el origen que
 * llega en la petición: ese se compara tal cual lo manda el navegador.
 */
const normalizeOrigin = (raw: string): string =>
    raw.trim().toLowerCase().replace(/\/+$/, '');

const parseOrigins = (raw: string | undefined): string[] =>
    (raw ?? '')
        .split(',')
        .map(normalizeOrigin)
        .filter((origin) => origin.length > 0);


export default registerAs(
    'cors',
    (): CorsConfig => {
        const origins = parseOrigins(process.env['CORS_ORIGINS']);
        const isProduction = process.env['NODE_ENV'] === Enviroment.Production;

        /**
         * Un asterisco abriría la API a cualquier origen, y eso no convive con la
         * sesión en cookies, porque el navegador no manda credenciales a un origen
         * comodín. Por eso la app se niega a arrancar en cualquier entorno, en vez
         * de levantar con un login que nunca va a funcionar. Para desarrollar no
         * hace falta, ya que localhost se permite en cualquier puerto.
         */
        if (origins.includes('*')) {
            throw new Error(
                'CORS_ORIGINS no admite el asterisco porque la sesión viaja en cookies. ' +
                'Escribe la lista de dominios del frontend.'
            );
        };

        return {
            origins,
            // En producción nunca, sin importar lo que digan las variables.
            allowLocalhost: !isProduction,
        };
    }
);
