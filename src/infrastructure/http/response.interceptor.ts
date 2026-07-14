import { Response } from "express";
import { Reflector } from "@nestjs/core";
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";

import { map, Observable } from "rxjs";

import { ApiResponse } from "@/interfaces";
import { RESPONSE_CODE, ResponseStatus } from "@/utils";
import { RESPONSE_MESSAGE_KEY } from "./response-message.decorator";


@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
    constructor(
        private readonly reflector: Reflector
    ) { };

    public intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
        const httpStatus = context.switchToHttp().getResponse<Response>().statusCode;
        const message = this.reflector.get<string>(RESPONSE_MESSAGE_KEY, context.getHandler()) ?? 'Operación exitosa.';

        return next.handle().pipe(
            map((data) => {
                // Consulta exitosa cuyo resultado viene vacío: no es un error,
                // pero se marca como INFO para que el cliente lo distinga.
                if (ResponseInterceptor.isEmptyResult(data)) {
                    return {
                        status: ResponseStatus.Info,
                        code: RESPONSE_CODE.NO_CONTENT,
                        httpStatus,
                        message: 'No se encontraron resultados.',
                        data: (data ?? null) as T | null,
                    };
                };

                return {
                    status: ResponseStatus.Success,
                    code: RESPONSE_CODE.SUCCESS,
                    httpStatus,
                    message,
                    data: (data ?? null) as T | null,
                };
            })
        );
    };


    /** Vacío = arreglo sin elementos, o resultado paginado sin filas. */
    private static isEmptyResult(data: unknown): boolean {
        if (Array.isArray(data)) {
            return data.length === 0;
        };

        if (data !== null && typeof data === 'object' && 'data' in data) {
            const inner = (data as { data: unknown }).data;
            return Array.isArray(inner) && inner.length === 0;
        };

        return false;
    };
};