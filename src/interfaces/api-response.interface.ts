import { ResponseStatus } from "@/utils";

export interface ApiResponse<T = unknown> {
    status: ResponseStatus;
    code: string;
    httpStatus: number;
    message: string;
    content: T | null;
    /**
     * Identificador de la petición, el mismo que viaja en el header
     * `X-Request-Id` y que acompaña a cada línea del log.
     *
     * Va en TODA respuesta, exitosa o no: es la referencia con la que se busca
     * qué pasó de verdad. El cliente lo reporta, soporte lo busca. Solo falta
     * si la respuesta se armó fuera del ciclo HTTP que abre el logger.
     */
    traceId?: string;
};



export interface Pagination {
    pageNumber: number;
    pageSize: number;
};



export interface Paginated<T> {
    rows: T[];
    pageNumber: number;
    pageSize: number;
    total: number;
};
