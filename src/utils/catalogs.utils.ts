export enum ResponseStatus {
    Success = 'SUCCESS',
    Error = 'ERROR',
    Warn = 'WARN',
    Info = 'INFO',
};



export enum ErrorCategory {
    Validation = 'VALIDATION',
    NotFound = 'NOT_FOUND',
    Conflict = 'CONFLICT',
    Unauthorized = 'UNAUTHORIZED',

    /**
     * Se sabe quién es y aun así no puede: distinto de Unauthorized, donde no se
     * sabe. La diferencia le importa al cliente, porque ante un 401 vuelve al
     * login y ante un 403 no tiene sentido que lo intente.
     */
    Forbidden = 'FORBIDDEN',

    Unavailable = 'UNAVAILABLE',
};



export interface CatalogEntryResponse {
    status: ResponseStatus;
    category: ErrorCategory;
    message: string;
};