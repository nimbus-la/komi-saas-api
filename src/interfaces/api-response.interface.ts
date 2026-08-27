import { ResponseStatus } from "@/utils";

export interface ApiResponse<T = unknown> {
    status: ResponseStatus;
    code: string;
    httpStatus: number;
    message: string;
    content: T | null;
    /**
     * Identificador de la respuesta de error, presente solo cuando la genera
     * AllExceptionsFilter. Es la referencia con la que se busca la causa
     * técnica en el log: el cliente lo reporta, soporte lo busca.
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
