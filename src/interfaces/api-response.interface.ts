import { ResponseStatus } from "@/utils";

export interface ApiResponse<T = unknown> {
    status: ResponseStatus;
    code: string;
    httpStatus: number;
    message: string;
    data: T | null;
};



export interface Pagination {
    pageNumber: number;
    pageSize: number;
};



export interface Paginated<T> {
    data: T[];
    pageNumber: number;
    pageSize: number;
    total: number;
};