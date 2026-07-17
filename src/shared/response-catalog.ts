import { CatalogEntryResponse, ErrorCategory, ResponseStatus } from "@/utils";



/**
 * Catálogo central de respuestas.
 * Rangos: 0xxx éxito · 1xxx validación · 2xxx recurso · 9xxx sistema.
 * El "message" es genérico y seguro: nunca expone datos internos.
 */
export const RESPONSE_CATALOG: Record<string, CatalogEntryResponse> = {
    '0000': { status: ResponseStatus.Success, category: ErrorCategory.Validation, message: 'Operación exitosa.' },
    '0001': { status: ResponseStatus.Info, category: ErrorCategory.Validation, message: 'No se encontraron resultados.' },
    '0002': { status: ResponseStatus.Info, category: ErrorCategory.Validation, message: 'Sucursal no encontrada. ' },
    '0003': { status: ResponseStatus.Info, category: ErrorCategory.Validation, message: 'Tenant no encontrado ' },
    
    // 1xxx — validación / reglas de dominio
    '1000': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'Los datos enviados no son válidos.' },
    '1001': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'La unidad de medida no es válida.' },
    '1002': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'El costo ingresado no es válido.' },
    '1003': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'El nombre del item no es válido.' },
    '1004': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'La operación monetaria no es válida.' },
    '1005': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'El nombre del tenant no es válido.' },
    '1006': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'El NIT del tenant no es válido.' },
    '1007': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'El slug del tenant no es válido.' },
    '1008': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'La descripción del tenant no es válida.' },
    '1009': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'El nombre de la sucursal no es válido.' },
    '1010': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'La dirección de la sucursal no es válida.' },
    '1011': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'El teléfono de la sucursal no es válido.' },
    '1012': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'La ciudad de la sucursal no es válida.' },
    '1013': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'El departamento de la sucursal no es válido.' },


    '1200': { status: ResponseStatus.Error, category: ErrorCategory.Conflict, message: 'El nombre del item ya se encuentra registrado.' },
    '1201': { status: ResponseStatus.Error, category: ErrorCategory.NotFound, message: 'El item de inventario no existe.' },
    '1202': { status: ResponseStatus.Error, category: ErrorCategory.Conflict, message: 'El NIT del tenant ya se encuentra registrado.' },
    '1203': { status: ResponseStatus.Error, category: ErrorCategory.Conflict, message: 'El slug del tenant ya se encuentra registrado.' },
    '1204': { status: ResponseStatus.Error, category: ErrorCategory.Conflict, message: 'El nombre del tenant ya se encuentra registrado.' },
    '1205': { status: ResponseStatus.Error, category: ErrorCategory.NotFound, message: 'El tenant indicado no existe.' },
    '1206': { status: ResponseStatus.Error, category: ErrorCategory.Conflict, message: 'El nombre de la sucursal ya se encuentra registrado.' },
    '1207': { status: ResponseStatus.Error, category: ErrorCategory.NotFound, message: 'La sucursal indicada no existe.' },

    // 13xx / reglas de lote y stock
    '1300': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'La fecha de vencimiento no es válida.' },
    '1310': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'La cantidad recibida del lote no es válida.' },
    '1311': { status: ResponseStatus.Error, category: ErrorCategory.Conflict, message: 'No hay cantidad suficiente en el lote.' },
    '1320': { status: ResponseStatus.Error, category: ErrorCategory.Conflict, message: 'El item está inactivo.' },
    '1321': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'El item perecedero requiere fecha de vencimiento.' },
    '1322': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'La cantidad a consumir debe ser mayor a cero.' },
    '1323': { status: ResponseStatus.Error, category: ErrorCategory.Conflict, message: 'Stock insuficiente para completar la operación.' },
    '1324': { status: ResponseStatus.Error, category: ErrorCategory.Conflict, message: 'No se puede cambiar la unidad de medida; el item ya tiene lotes.' },
    '1325': { status: ResponseStatus.Error, category: ErrorCategory.Conflict, message: 'No se puede cambiar la perecibilidad; el item ya tiene lotes.' },
    '1326': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'Debe enviar al menos un campo para actualizar.' },
    '1330': { status: ResponseStatus.Error, category: ErrorCategory.NotFound, message: 'La sucursal indicada no existe.' },
    '1331': { status: ResponseStatus.Error, category: ErrorCategory.Conflict, message: 'Debe especificar una sucursal para esta operación.' },

    '1500': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'La cantidad del movimiento debe ser mayor a cero.' },
    '1501': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'Este tipo de movimiento requiere un motivo.' },

    // 2xxx — recurso
    '2000': { status: ResponseStatus.Error, category: ErrorCategory.NotFound, message: 'El recurso solicitado no existe.' },
    '2001': { status: ResponseStatus.Warn, category: ErrorCategory.Conflict, message: 'El item ya se encuentra registrado.' },

    // 9xxx — sistema
    '9999': { status: ResponseStatus.Error, category: ErrorCategory.Unavailable, message: 'Ocurrió un error inesperado. Intente más tarde.' },
};