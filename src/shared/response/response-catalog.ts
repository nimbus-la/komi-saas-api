import { ErrorCategory } from "../exception/error-category.exception";
import { ResponseStatus } from "./response-status";


export interface CatalogEntry {
    status: ResponseStatus;
    category: ErrorCategory;
    message: string;
};


/**
 * Catálogo central de respuestas.
 * Rangos: 0xxx éxito · 1xxx validación · 2xxx recurso · 9xxx sistema.
 * El "message" es genérico y seguro: nunca expone datos internos.
 */
export const RESPONSE_CATALOG: Record<string, CatalogEntry> = {
    '0000': { status: ResponseStatus.Success, category: ErrorCategory.VALIDATION, message: 'Operación exitosa.' },

    // 1xxx — validación / reglas de dominio
    '1000': { status: ResponseStatus.Error, category: ErrorCategory.VALIDATION, message: 'Los datos enviados no son válidos.' },
    '1001': { status: ResponseStatus.Error, category: ErrorCategory.VALIDATION, message: 'La unidad de medida no es válida.' },
    '1002': { status: ResponseStatus.Error, category: ErrorCategory.VALIDATION, message: 'El costo ingresado no es válido.' },
    '1003': { status: ResponseStatus.Error, category: ErrorCategory.VALIDATION, message: 'El nombre del item no es válido.' },
    '1004': { status: ResponseStatus.Error, category: ErrorCategory.VALIDATION, message: 'El nombre del tenant no es válido.' },
    '1005': { status: ResponseStatus.Error, category: ErrorCategory.VALIDATION, message: 'El NIT del tenant no es válido.' },
    '1006': { status: ResponseStatus.Error, category: ErrorCategory.VALIDATION, message: 'El slug del tenant no es válido.' },

    '1200': { status: ResponseStatus.Error, category: ErrorCategory.CONFLICT, message: 'El nombre del item ya se encuentra registrado.' },
    '1201': { status: ResponseStatus.Error, category: ErrorCategory.CONFLICT, message: 'El nombre del tenant ya se encuentra registrado.' },
    '1202': { status: ResponseStatus.Error, category: ErrorCategory.CONFLICT, message: 'El NIT del tenant ya se encuentra registrado.' },
    '1203': { status: ResponseStatus.Error, category: ErrorCategory.CONFLICT, message: 'El slug del tenant ya se encuentra registrado.' },
    '1007': { status: ResponseStatus.Error, category: ErrorCategory.VALIDATION, message: 'La descripción del tenant no es válida.' },
    
    // 2xxx — recurso
    '2000': { status: ResponseStatus.Error, category: ErrorCategory.NOT_FOUND, message: 'El recurso solicitado no existe.' },
    '2001': { status: ResponseStatus.Warn, category: ErrorCategory.CONFLICT, message: 'El item ya se encuentra registrado.' },

    // 9xxx — sistema
    '9999': { status: ResponseStatus.Error, category: ErrorCategory.UNAVAILABLE, message: 'Ocurrió un error inesperado. Intente más tarde.' },
};


export const SUCCESS_CODE = '0000';
export const UNEXPECTED_CODE = '9999';