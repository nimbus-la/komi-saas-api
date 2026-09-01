/**
 * Doble de `uuid` para las pruebas.
 *
 * `uuid@14` solo publica ESM. ts-jest no transpila lo que vive dentro de
 * node_modules, y hacer `require()` del ESM real tampoco sirve: el namespace lo
 * crea el loader de Node fuera del contexto de `vm` donde Jest ejecuta las
 * pruebas, y del otro lado llega un objeto sin propiedades. De ahí este doble.
 *
 * Implementa solo lo que el dominio usa —`v7` y `validate`— respetando el
 * formato de la RFC 9562, para que los value objects se comporten igual que en
 * producción. Se enchufa desde `moduleNameMapper` en la configuración de jest.
 *
 * Si algún día el dominio necesita otra función del paquete, hay que añadirla
 * aquí o el import fallará con undefined.
 */
const { randomBytes } = require('node:crypto');

const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** UUID versión 7: 48 bits de milisegundos por delante, el resto aleatorio. */
const v7 = () => {
    const bytes = randomBytes(16);

    const millis = Date.now();
    bytes.writeUIntBE(millis, 0, 6);

    // Los cuatro bits altos del byte 6 llevan la versión (7).
    bytes[6] = (bytes[6] & 0x0f) | 0x70;
    // Los dos bits altos del byte 8 llevan la variante RFC (10xx).
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = bytes.toString('hex');

    return [
        hex.slice(0, 8),
        hex.slice(8, 12),
        hex.slice(12, 16),
        hex.slice(16, 20),
        hex.slice(20),
    ].join('-');
};

const validate = (value) => typeof value === 'string' && UUID_PATTERN.test(value);

module.exports = { v7, validate };
