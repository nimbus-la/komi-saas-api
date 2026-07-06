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
    '1004': { status: ResponseStatus.Error, category: ErrorCategory.VALIDATION, message: 'La operación monetaria no es válida.' },

    '1200': { status: ResponseStatus.Error, category: ErrorCategory.CONFLICT, message: 'El nombre del item ya se encuentra registrado.' },

    '1201': { status: ResponseStatus.Error, category: ErrorCategory.NOT_FOUND, message: 'El item de inventario no existe.' },

    // 13xx / reglas de lote y stock
    '1300': { status: ResponseStatus.Error, category: ErrorCategory.VALIDATION, message: 'La fecha de vencimiento no es válida.' },
    '1310': { status: ResponseStatus.Error, category: ErrorCategory.VALIDATION, message: 'La cantidad recibida del lote no es válida.' },
    '1311': { status: ResponseStatus.Error, category: ErrorCategory.CONFLICT, message: 'No hay cantidad suficiente en el lote.' },
    '1320': { status: ResponseStatus.Error, category: ErrorCategory.CONFLICT, message: 'El item está inactivo.' },
    '1321': { status: ResponseStatus.Error, category: ErrorCategory.VALIDATION, message: 'El item perecedero requiere fecha de vencimiento.' },
    '1322': { status: ResponseStatus.Error, category: ErrorCategory.VALIDATION, message: 'La cantidad a consumir debe ser mayor a cero.' },
    '1323': { status: ResponseStatus.Error, category: ErrorCategory.CONFLICT, message: 'Stock insuficiente para completar la operación.' },
    '1324': { status: ResponseStatus.Error, category: ErrorCategory.CONFLICT, message: 'No se puede cambiar la unidad de medida; el item ya tiene lotes.' },
    '1325': { status: ResponseStatus.Error, category: ErrorCategory.CONFLICT, message: 'No se puede cambiar la perecibilidad; el item ya tiene lotes.' },
    '1326': { status: ResponseStatus.Error, category: ErrorCategory.VALIDATION, message: 'Debe enviar al menos un campo para actualizar.' },

    // 2xxx — recurso
    '2000': { status: ResponseStatus.Error, category: ErrorCategory.NOT_FOUND, message: 'El recurso solicitado no existe.' },
    '2001': { status: ResponseStatus.Warn, category: ErrorCategory.CONFLICT, message: 'El item ya se encuentra registrado.' },

    // 9xxx — sistema
    '9999': { status: ResponseStatus.Error, category: ErrorCategory.UNAVAILABLE, message: 'Ocurrió un error inesperado. Intente más tarde.' },
};


export const SUCCESS_CODE = '0000';
export const UNEXPECTED_CODE = '9999';