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
    '1002': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'El costo ingresado no es válido.' },
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
    '1014': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'El identificador no es válido.' },
    '1015': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'La cantidad ingresada no es válida.' },


    '1202': { status: ResponseStatus.Error, category: ErrorCategory.Conflict, message: 'El NIT del tenant ya se encuentra registrado.' },
    '1203': { status: ResponseStatus.Error, category: ErrorCategory.Conflict, message: 'El slug del tenant ya se encuentra registrado.' },
    '1204': { status: ResponseStatus.Error, category: ErrorCategory.Conflict, message: 'El nombre del tenant ya se encuentra registrado.' },
    '1205': { status: ResponseStatus.Error, category: ErrorCategory.NotFound, message: 'El tenant indicado no existe.' },
    '1206': { status: ResponseStatus.Error, category: ErrorCategory.Conflict, message: 'El nombre de la sucursal ya se encuentra registrado.' },
    '1207': { status: ResponseStatus.Error, category: ErrorCategory.NotFound, message: 'La sucursal indicada no existe.' },

    // 13xx — estándar de errores de INVENTARIO (1300-1399)
    //   1300-1309 Item (catálogo) · 1310-1319 Lote · 1320-1329 Movimientos de stock
    //   1330-1339 Sucursal (scope) · 1340-1349 Configuración de sucursal (mínimos)
    //   1350-1359 Reglas de actualización del item
    '1300': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'El nombre del item no es válido.' },
    '1301': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'La unidad de medida no es válida.' },
    '1302': { status: ResponseStatus.Error, category: ErrorCategory.Conflict, message: 'El nombre del item ya se encuentra registrado.' },
    '1303': { status: ResponseStatus.Error, category: ErrorCategory.NotFound, message: 'El item de inventario no existe.' },
    '1304': { status: ResponseStatus.Error, category: ErrorCategory.Conflict, message: 'El item está inactivo.' },
    '1305': { status: ResponseStatus.Error, category: ErrorCategory.NotFound, message: 'El tenant indicado no existe.' },

    '1310': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'La cantidad recibida del lote no es válida.' },
    '1311': { status: ResponseStatus.Error, category: ErrorCategory.Conflict, message: 'No hay cantidad suficiente en el lote.' },
    '1312': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'La fecha de vencimiento no es válida.' },
    '1313': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'El item perecedero requiere fecha de vencimiento.' },
    '1314': { status: ResponseStatus.Error, category: ErrorCategory.NotFound, message: 'El lote indicado no existe en el item.' },

    '1320': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'La cantidad a consumir debe ser mayor a cero.' },
    '1321': { status: ResponseStatus.Error, category: ErrorCategory.Conflict, message: 'Stock insuficiente para completar la operación.' },
    '1322': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'Debe indicar el motivo de la operación.' },
    '1323': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'No hay diferencia que ajustar.' },
    '1324': { status: ResponseStatus.Error, category: ErrorCategory.Conflict, message: 'El sobrante del conteo debe registrarse como una entrada de mercancía.' },
    '1325': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'La cantidad del movimiento debe ser mayor a cero.' },
    '1326': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'Este tipo de movimiento requiere un motivo.' },
    '1327': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'El tipo de movimiento no es soportado.' },

    '1330': { status: ResponseStatus.Error, category: ErrorCategory.Conflict, message: 'Debe especificar una sucursal para esta operación.' },
    '1331': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'Una sucursal aparece repetida en la configuración.' },
    '1332': { status: ResponseStatus.Error, category: ErrorCategory.NotFound, message: 'La sucursal indicada no existe.' },

    '1340': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'Debe indicar el mínimo global, una sucursal o un listado de sucursales.' },
    '1341': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'Debe indicar la cantidad mínima para la sucursal.' },

    '1350': { status: ResponseStatus.Error, category: ErrorCategory.Conflict, message: 'No se puede cambiar la unidad de medida; el item ya tiene lotes.' },
    '1351': { status: ResponseStatus.Error, category: ErrorCategory.Conflict, message: 'No se puede cambiar la perecibilidad; el item ya tiene lotes.' },
    '1352': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'Debe enviar al menos un campo para actualizar.' },

    // Rangos de códigos de error
    // Productos: 1400 - 1433
    '1400': { status: ResponseStatus.Error, category: ErrorCategory.NotFound, message: 'No se encontró el producto que intentas editar.' },
    '1401': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'El nombre del producto es inválido.' },
    '1402': { status: ResponseStatus.Error, category: ErrorCategory.Conflict, message: 'Ya existe un producto registrado con ese nombre' },
    '1403': { status: ResponseStatus.Error, category: ErrorCategory.Conflict, message: 'No se pudo obtener el siguiente valor de la secuencia de SKU.' },
    '1404': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'El producto ya se encuentra desactivado.' },
    '1405': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'El producto ya se encuentra activado.' },
    '1406': { status: ResponseStatus.Error, category: ErrorCategory.Conflict, message: 'El ítem de inventario especificado no pertenece al tenant proporcionado.' },
    '1407': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'El margen de beneficio no puede ser menor que 0.' },
    '1408': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'No se encontraron cambios para actualizar el producto.' },
    '1409': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'El tenantId es obligatorio para buscar' },

    // Categorías: 1434 - 1466
    '1434': { status: ResponseStatus.Error, category: ErrorCategory.NotFound, message: 'No se encontró la categoría.' },
    '1435': { status: ResponseStatus.Error, category: ErrorCategory.Conflict, message: 'Ya existe una categoría registrada con ese nombre.' },
    '1436': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'La categoría ya se encuentra activada.' },
    '1437': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'La categoría ya se encuentra desactivada.' },
    '1438': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'El nombre de la categoría debe tener al menos 2 caracteres.' },
    '1439': { status: ResponseStatus.Error, category: ErrorCategory.Validation, message: 'El nombre de la categoría debe tener como máximo 120 caracteres.' },

    // Recetas: 1467 - 4999
    '1467': { status: ResponseStatus.Error, category: ErrorCategory.Conflict, message: 'El ingrediente seleccionado ya se encuentra agregado a la receta.' },
    '1468': { status: ResponseStatus.Error, category: ErrorCategory.Conflict, message: 'El ingrediente no se encuentra agregado a la receta.' },
    '1469': { status: ResponseStatus.Error, category: ErrorCategory.Conflict, message: 'No se encontró el ítem de inventario.' },
    '1470': { status: ResponseStatus.Error, category: ErrorCategory.Conflict, message: 'El ingrediente seleccionado no está disponible para este negocio.' },

    // 2xxx — recurso
    '2000': { status: ResponseStatus.Error, category: ErrorCategory.NotFound, message: 'El recurso solicitado no existe.' },
    '2001': { status: ResponseStatus.Warn, category: ErrorCategory.Conflict, message: 'El item ya se encuentra registrado.' },

    // 9xxx — sistema
    '9999': { status: ResponseStatus.Error, category: ErrorCategory.Unavailable, message: 'Ocurrió un error inesperado. Intente más tarde.' },
};