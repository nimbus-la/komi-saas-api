import { randomBytes } from "node:crypto";

import { NextFunction, Request, Response } from "express";



/** Header por el que entra y sale el identificador. */
export const REQUEST_ID_HEADER = 'X-Request-Id';


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
const SAFE_REQUEST_ID = /^[A-Za-z0-9-]{8,64}$/;


/** Petición con el identificador ya resuelto. */
export interface RequestWithId extends Request {
    requestId?: string;
};


export const createRequestId = (): string => randomBytes(6).toString('hex');


/**
 * Devuelve el identificador que mandó el cliente si es utilizable; si no, uno
 * nuevo.
 *
 * Se acepta el del cliente a propósito: así el front conserva la referencia
 * aunque la petición nunca llegue al servidor (timeout, red caída), que es
 * justo cuando más falta hace. Y se puede aceptar sin riesgo porque el
 * identificador NO es una frontera de seguridad: no autentica, no autoriza y
 * no identifica a nadie. Quien lo manipule solo ensucia la correlación de sus
 * propias peticiones.
 */
export const resolveRequestId = (incoming: unknown): string =>
    typeof incoming === 'string' && SAFE_REQUEST_ID.test(incoming)
        ? incoming
        : createRequestId();


/**
 * Asigna un identificador a CADA petición, termine bien o mal, y lo devuelve
 * en el header `X-Request-Id`.
 *
 * Va antes que todo lo demás. Si el identificador naciera dentro del filtro de
 * excepciones solo existiría cuando algo falla, y nada de lo que ocurre antes
 * —ni una respuesta exitosa— podría referenciarlo.
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const requestId = resolveRequestId(req.headers['x-request-id']);

    (req as RequestWithId).requestId = requestId;
    res.setHeader(REQUEST_ID_HEADER, requestId);

    next();
};
