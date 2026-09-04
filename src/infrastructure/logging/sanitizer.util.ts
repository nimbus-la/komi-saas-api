/** Lo que se escribe en lugar del valor de un campo sensible. */
export const REDACTED = '[REDACTADO]';


/**
 * Campos cuyo valor no se escribe nunca. Se comparan en minúsculas y por
 * nombre exacto, da igual a qué profundidad aparezcan.
 */
export const SENSITIVE_FIELDS: readonly string[] = [
    'password',
    'newpassword',
    'oldpassword',
    'currentpassword',
    'confirmpassword',
    'passwordhash',
    'hashedpassword',
    'secret',
    'clientsecret',
    'token',
    'accesstoken',
    'refreshtoken',
    'idtoken',
    'apikey',
    'api_key',
    'authorization',
    'cookie',
    'sessionid',
];


const BLACKLIST: ReadonlySet<string> = new Set(SENSITIVE_FIELDS);


/**
 * Hasta dónde baja dentro de un objeto anidado. No es una medida de seguridad
 * sino de coste, porque un log no debería costar más que la operación que
 * describe y un objeto de treinta niveles casi siempre es un error de quien lo
 * manda.
 */
const MAX_DEPTH = 8;


/**
 * Longitud máxima de un texto. Un cuerpo con una imagen en base64 son varios
 * megabytes que, sin este tope, acaban enteros en el disco.
 */
const MAX_STRING_LENGTH = 2_000;


/** Elementos que se conservan de un arreglo antes de resumir el resto. */
const MAX_ARRAY_ITEMS = 20;


/**
 * Devuelve una copia del valor lista para escribir, sin los campos sensibles y
 * con el tamaño acotado.
 *
 * Hace falta porque el `redact` de pino trabaja con rutas fijas y su comodín
 * solo baja un nivel, así que tapaba `body.password` pero escribía en claro un
 * `body.credentials.password`. Un secreto solo está a salvo si no depende de la
 * forma que traiga el objeto.
 *
 * No modifica lo que recibe, de modo que el cuerpo sigue su camino hacia el
 * controlador intacto.
 */
export const sanitize = (value: unknown, depth = 0): unknown => {
    if (typeof value === 'string') {
        return truncate(value);
    };

    if (value === null || typeof value !== 'object') {
        return value;
    };

    // Una fecha no tiene propiedades propias, así que recorrerla campo a campo
    // la dejaría en {}. Es justo lo que traen los eventos en su `occurredOn`.
    if (value instanceof Date) {
        return value.toISOString();
    };

    // El error se devuelve tal cual, que pino tiene su propio serializador y le
    // saca el stack y los errores anidados. Tocarlo aquí solo quitaría cosas.
    if (value instanceof Error) {
        return value;
    };

    // Un búfer no se recorre. `Object.entries` lo convertiría en un objeto con
    // una clave por byte, o sea un millón de claves para un adjunto de un mega.
    // De su contenido no hay nada que leer, solo interesa que estaba y cuánto
    // ocupaba.
    if (Buffer.isBuffer(value)) {
        return `[Buffer ${value.byteLength} bytes]`;
    };

    if (depth >= MAX_DEPTH) {
        return '[PROFUNDIDAD MAXIMA]';
    };

    if (Array.isArray(value)) {
        return sanitizeArray(value, depth);
    };

    return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(
            ([key, nested]) => BLACKLIST.has(key.toLowerCase())
                ? [key, REDACTED]
                : [key, sanitize(nested, depth + 1)]
        )
    );
};


/**
 * Los primeros elementos y cuántos quedaron fuera. Recortar importa tanto como
 * tapar, porque una consulta de diez mil filas no puede volverse diez mil
 * líneas de log.
 */
const sanitizeArray = (value: readonly unknown[], depth: number): unknown[] => {
    const visible: unknown[] = value
        .slice(0, MAX_ARRAY_ITEMS)
        .map((item) => sanitize(item, depth + 1));

    if (value.length > MAX_ARRAY_ITEMS) {
        visible.push(`[+${value.length - MAX_ARRAY_ITEMS} elementos]`);
    };

    return visible;
};


/** Avisa de cuánto se cortó, porque un texto truncado sin más engaña al leerlo. */
const truncate = (value: string): string =>
    value.length <= MAX_STRING_LENGTH
        ? value
        : `${value.slice(0, MAX_STRING_LENGTH)} [+${value.length - MAX_STRING_LENGTH} caracteres]`;
