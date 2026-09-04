import { ObjectLiteral } from "typeorm";


/** Los parámetros de una consulta, tal como los entrega TypeORM. */
export type QueryParameters = unknown[] | ObjectLiteral | undefined;


/**
 * A partir de cuántos caracteres deja de valer la pena leer la lista de
 * columnas de un SELECT. Por debajo de eso —`SELECT id, name FROM ...`— la
 * lista dice más que un resumen.
 */
const MAX_COLUMNS_LENGTH = 120;


/** Longitud máxima de un valor incrustado. Corta hashes y textos enormes. */
const MAX_VALUE_LENGTH = 80;


/** Tope de la consulta ya legible: un INSERT masivo no puede ocupar la pantalla. */
const MAX_QUERY_LENGTH = 600;


/**
 * Deja la consulta como se lee: con los valores puestos y sin la parrafada de
 * alias del SELECT.
 *
 * TypeORM entrega la consulta con marcadores posicionales (`$1`, `$2`) y los
 * valores en un arreglo aparte, así que para saber qué se buscó había que
 * contar marcadores con el dedo. Y la lista de columnas de un SELECT de
 * TypeORM son seiscientos caracteres de `"X"."campo" AS "X_campo"` repetido
 * para decir "traé el tenant".
 *
 * El resultado es para LEER, no para volver a ejecutar: si hace falta la
 * consulta exacta, está en la base de datos.
 */
export const readableQuery = (query: string, parameters: QueryParameters): string =>
    truncate(collapseColumns(inlineParameters(query, parameters)), MAX_QUERY_LENGTH);


/** Sustituye `$1`, `$2`… por su valor. Deja el marcador si no hay valor. */
const inlineParameters = (query: string, parameters: QueryParameters): string => {
    if (!Array.isArray(parameters) || parameters.length === 0) {
        return query;
    };

    // El número se captura del propio marcador, así que `$10` no se confunde
    // nunca con `$1` seguido de un cero.
    return query.replace(/\$(\d+)/g, (marker, position: string) => {
        const value = parameters[Number(position) - 1];

        return value === undefined ? marker : formatValue(value);
    });
};


/** Un valor como lo escribiría alguien en un cliente SQL. */
const formatValue = (value: unknown): string => {
    if (value === null) {
        return 'NULL';
    };

    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    };

    if (value instanceof Date) {
        return `'${value.toISOString()}'`;
    };

    if (Array.isArray(value)) {
        return `(${value.map(formatValue).join(', ')})`;
    };

    return `'${truncate(String(value), MAX_VALUE_LENGTH)}'`;
};


/**
 * Cambia la lista de columnas de un SELECT largo por cuántas son.
 *
 * El recuento parte por comas, así que una función con varios argumentos
 * cuenta de más. No importa: es una pista de tamaño en un log, no un análisis
 * sintáctico.
 */
const collapseColumns = (query: string): string => {
    const columns = /^SELECT\s+(?:DISTINCT\s+)?([\s\S]+?)\s+FROM\s/i.exec(query)?.[1];

    if (columns === undefined || columns.length <= MAX_COLUMNS_LENGTH) {
        return query;
    };

    return query.replace(columns, `${columns.split(',').length} cols`);
};


const truncate = (text: string, limit: number): string =>
    text.length <= limit ? text : `${text.slice(0, limit)}...`;
