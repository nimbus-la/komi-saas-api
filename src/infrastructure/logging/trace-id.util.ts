import { randomBytes } from "node:crypto";


/** Header por el que entra y sale el identificador de la petición. */
export const TRACE_ID_HEADER = 'X-Request-Id';


/**
 * Un identificador del cliente que es seguro registrar: letras, dígitos y
 * guiones, con longitud acotada.
 *
 * Node ya rechaza en el parser los saltos de línea y los caracteres de control
 * dentro de un header —así que no se puede inyectar una línea falsa en el log—
 * y corta los headers gigantes con un 431. Lo que este patrón cierra es lo que
 * sí pasaría: texto plano que imite el formato del log y confunda un grep, y
 * datos personales colados ahí por descuido del front.
 */
const SAFE_TRACE_ID = /^[A-Za-z0-9-]{8,64}$/;


/** Identificador nuevo: 12 caracteres hexadecimales. */
export const createTraceId = (): string => randomBytes(6).toString('hex');


/**
 * Devuelve el identificador que mandó el cliente si es utilizable; si no, uno
 * nuevo.
 *
 * Se acepta el del cliente a propósito: así el front conserva la referencia
 * aunque la petición nunca llegue al servidor —timeout, red caída—, que es
 * justo cuando más falta hace. Y se puede aceptar sin riesgo porque el
 * identificador NO es una frontera de seguridad: no autentica, no autoriza y
 * no identifica a nadie. Quien lo manipule solo ensucia la correlación de sus
 * propias peticiones.
 */
export const resolveTraceId = (incoming: unknown): string =>
    typeof incoming === 'string' && SAFE_TRACE_ID.test(incoming)
        ? incoming
        : createTraceId();
