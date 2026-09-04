/** Marca que sustituye al valor de un campo sensible. */
export const REDACTED = '[REDACTADO]';


/**
 * Nombres de campo cuyo VALOR nunca se escribe, comparados en minúsculas y por
 * coincidencia exacta, a cualquier profundidad.
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
 * Hasta dónde baja el saneador dentro de un objeto anidado.
 *
 * No es una restricción de seguridad sino de coste: un log no debería costar
 * más que la operación que describe, y un payload de treinta niveles casi
 * siempre es un error de quien lo manda.
 */
const MAX_DEPTH = 8;


/**
 * Longitud máxima de un texto. Un cuerpo con una imagen en base64 son varios
 * megabytes que, sin esto, acaban enteros en el log y en el disco.
 */
const MAX_STRING_LENGTH = 2_000;


/** Elementos que se conservan de un arreglo antes de resumir el resto. */
const MAX_ARRAY_ITEMS = 20;


/**
 * Devuelve una copia del valor lista para escribir en el log: sin los campos
 * sensibles, mire a la profundidad que mire, y con el tamaño acotado.
 *
 * Existe porque `redact` de pino no basta: sus rutas son fijas y su comodín
 * cubre UN nivel, así que `body.password` quedaba tapado pero
 * `body.credentials.password` se escribía en claro. Un secreto solo está a
 * salvo si el saneador no depende de la forma que traiga el objeto.
 *
 * No muta lo que recibe: lo saneado es otra cosa, y el cuerpo que sigue su
 * camino hacia el controlador queda intacto.
 */
export const sanitize = (value: unknown, depth = 0): unknown => {
    if (typeof value === 'string') {
        return truncate(value);
    };

    if (value === null || typeof value !== 'object') {
        return value;
    };

    /**
     * Una fecha es un objeto sin propiedades propias: recorrerla campo a campo
     * la dejaría en `{}`. Y es justo lo que traen los eventos de dominio en su
     * `occurredOn`, así que perderla vaciaría el log de auditoría.
     */
    if (value instanceof Date) {
        return value.toISOString();
    };

    /**
     * El error se devuelve tal cual: pino tiene un serializador propio que le
     * saca el tipo, el mensaje, el stack y los errores anidados —el
     * `driverError` de TypeORM—. Recorrerlo aquí solo quitaría información.
     */
    if (value instanceof Error) {
        return value;
    };

    /**
     * Un búfer no se recorre campo a campo: `Object.entries` lo convertiría en
     * un objeto con una clave numérica por byte, así que un adjunto de un mega
     * serían un millón de claves. Del contenido no hay nada que leer; lo único
     * que dice algo es que estaba y cuánto ocupaba.
     */
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
 * Los primeros elementos y cuántos quedaron fuera.
 *
 * El recorte importa tanto como la redacción: una consulta que devuelve diez
 * mil filas no puede convertirse en diez mil líneas de log.
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


/** Deja constancia de cuánto se cortó: un texto truncado sin aviso engaña. */
const truncate = (value: string): string =>
    value.length <= MAX_STRING_LENGTH
        ? value
        : `${value.slice(0, MAX_STRING_LENGTH)} [+${value.length - MAX_STRING_LENGTH} caracteres]`;
