import { Response } from "express";
import { Reflector } from "@nestjs/core";
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";

import { map, Observable } from "rxjs";

import { ApiResponse } from "@/interfaces";
import { RESPONSE_CODE, ResponseStatus } from "@/utils";
import { RequestWithId } from "./request-id.middleware";
import { RESPONSE_MESSAGE_KEY } from "./response-message.decorator";


@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
    constructor(
        private readonly reflector: Reflector
    ) { };

    public intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
        const httpStatus = context.switchToHttp().getResponse<Response>().statusCode;
        const message = this.reflector.get<string>(RESPONSE_MESSAGE_KEY, context.getHandler()) ?? 'Operación exitosa.';

        /**
         * El mismo identificador que ya viaja en el header `X-Request-Id` y que
         * el filtro pone en las respuestas de error.
         *
         * También en las exitosas: si el front guarda el `traceId` de TODA
         * respuesta, cuando el usuario reporte "esto se guardó mal" hay por
         * dónde empezar a buscar en el log. Limitarlo a los errores solo sirve
         * cuando el fallo se manifiesta como error, que es justo el caso fácil.
         */
        const traceId = context.switchToHttp().getRequest<RequestWithId>().requestId;

        return next.handle().pipe(
            map((data) => {
                // Consulta exitosa cuyo resultado viene vacío: no es un error,
                // pero se marca como INFO para que el cliente lo distinga.
                // El sobre se anula siempre: ni un arreglo vacío ni los
                // metadatos de página sueltos le aportan algo al cliente.
                if (ResponseInterceptor.isEmptyResult(data)) {
                    return {
                        status: ResponseStatus.Info,
                        code: RESPONSE_CODE.NO_CONTENT,
                        httpStatus,
                        message: 'No se encontraron resultados.',
                        content: null,
                        ...(traceId !== undefined ? { traceId } : {}),
                    };
                };

                return {
                    status: ResponseStatus.Success,
                    code: RESPONSE_CODE.SUCCESS,
                    httpStatus,
                    message,
                    content: (data ?? null) as T | null,
                    ...(traceId !== undefined ? { traceId } : {}),
                };
            })
        );
    };


    /** Vacío = arreglo sin elementos, o resultado paginado sin filas. */
    private static isEmptyResult(data: unknown): boolean {
        if (Array.isArray(data)) {
            return data.length === 0;
        };

        return ResponseInterceptor.isEmptyPaginated(data);
    };


    /** Resultado paginado (`rows` + metadatos) que no trajo ninguna fila. */
    private static isEmptyPaginated(data: unknown): boolean {
        if (data === null || typeof data !== 'object' || !('rows' in data)) {
            return false;
        };

        const rows = (data as { rows: unknown }).rows;
        return Array.isArray(rows) && rows.length === 0;
    };
};
