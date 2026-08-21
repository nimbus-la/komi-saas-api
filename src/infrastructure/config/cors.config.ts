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
        const allowAnyOrigin = origins.includes('*');

        // Mismo criterio que allowLocalhost: en producción esto no se avisa,
        // se impide. Un warning en el log de un deploy no lo lee nadie.
        if (allowAnyOrigin && isProduction) {
            throw new Error(
                "CORS_ORIGINS no puede contener '*' con NODE_ENV=production. " +
                'Declara la lista explícita de dominios del frontend.'
            );
        };

        return {
            // '*' se trata como bandera explícita, nunca como un origen más
            origins: origins.filter((origin) => origin !== '*'),
            allowAnyOrigin,
            /**
             * Comparación en positivo: un typo ('False', '0', 'no') apaga las
             * credenciales en lugar de habilitarlas. Ausente => true, que es
             * lo que necesita el front para mandar cookies.
             */
            credentials: (process.env['CORS_CREDENTIALS'] ?? 'true') === 'true',
            maxAge: parseInt(process.env['CORS_MAX_AGE'] ?? '86400', 10),
            // En producción NUNCA, sin importar lo que digan las variables
            allowLocalhost: !isProduction,
        };
    }
);
