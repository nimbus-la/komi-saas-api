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
 * Devuelve una copia del valor con los campos sensibles tapados, mire a la
 * profundidad que mire.
 *
 * Existe porque `redact` de pino no basta: sus rutas son fijas y su comodín
 * cubre UN nivel, así que `body.password` quedaba tapado pero
 * `body.credentials.password` se escribía en claro. Un secreto solo está a
 * salvo si el saneador no depende de la forma que traiga el cuerpo.
 *
 * No muta lo que recibe: el objeto saneado es otro, y el cuerpo que sigue su
 * camino hacia el controlador queda intacto.
 */
export const sanitize = (value: unknown, depth = 0): unknown => {
    if (depth > MAX_DEPTH) {
        return '[PROFUNDIDAD MAXIMA]';
    };

    if (Array.isArray(value)) {
        return value.map((item) => sanitize(item, depth + 1));
    };

    if (value === null || typeof value !== 'object') {
        return value;
    };

    return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(
            ([key, nested]) => BLACKLIST.has(key.toLowerCase())
                ? [key, REDACTED]
                : [key, sanitize(nested, depth + 1)]
        )
    );
};
