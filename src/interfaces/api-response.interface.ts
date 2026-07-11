import { ResponseStatus } from "@/utils";

export interface ApiResponse<T = unknown> {
    status: ResponseStatus;
    code: string;
    httpStatus: number;
    message: string;
    data: T | null;
};