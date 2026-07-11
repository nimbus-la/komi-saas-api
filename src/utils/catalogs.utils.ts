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
    Unavailable = 'UNAVAILABLE',
};



export interface CatalogEntryResponse {
    status: ResponseStatus;
    category: ErrorCategory;
    message: string;
};