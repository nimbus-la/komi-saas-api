import { randomBytes } from "node:crypto";


/** Header por el que entra y sale el identificador de la petición. */
export const TRACE_ID_HEADER = 'X-Request-Id';


/**
 * Un identificador que llega del cliente y es seguro registrar, o sea letras,
 * dígitos y guiones, con la longitud acotada.
 *
 * Node ya rechaza los saltos de línea y los caracteres de control dentro de un
 * header, así que nadie puede colar una línea falsa en el log, y corta los
 * headers gigantes con un 431. Lo que evita este patrón es lo que sí pasaría,
 * o sea texto que imite el formato del log y confunda un grep, o datos
 * personales metidos ahí por descuido del front.
 */
const SAFE_TRACE_ID = /^[A-Za-z0-9-]{8,64}$/;


/** Un identificador nuevo, de 12 caracteres hexadecimales. */
export const createTraceId = (): string => randomBytes(6).toString('hex');


/**
 * Devuelve el identificador que mandó el cliente si sirve, y si no uno nuevo.
 *
 * Se acepta el suyo a propósito, porque así el front conserva la referencia
 * aunque la petición nunca llegue al servidor por un timeout o una caída de
 * red, que es cuando más falta hace. Se puede aceptar sin riesgo porque este
 * identificador no autentica, no autoriza ni identifica a nadie. Quien lo
 * manipule solo se ensucia la correlación de sus propias peticiones.
 */
export const resolveTraceId = (incoming: unknown): string =>
    typeof incoming === 'string' && SAFE_TRACE_ID.test(incoming)
        ? incoming
        : createTraceId();
