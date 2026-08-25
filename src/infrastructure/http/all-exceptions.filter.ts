import { Response } from "express";
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";

import { DomainException, RESPONSE_CATALOG } from "@/shared";
import { CatalogEntryResponse, ErrorCategory, RESPONSE_CODE } from "@/utils";
import { ApiResponse } from "@/interfaces";



@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);


    private static readonly CATEGORY_TO_HTTP: Record<ErrorCategory, HttpStatus> = {
        [ErrorCategory.Validation]: HttpStatus.BAD_REQUEST,
        [ErrorCategory.NotFound]: HttpStatus.NOT_FOUND,
        [ErrorCategory.Conflict]: HttpStatus.CONFLICT,
        [ErrorCategory.Unauthorized]: HttpStatus.UNAUTHORIZED,
        [ErrorCategory.Unavailable]: HttpStatus.SERVICE_UNAVAILABLE,
    };


    public catch(exception: unknown, host: ArgumentsHost): void {
        const response = host.switchToHttp().getResponse<Response>();
        const envelope = this.toEnvelope(exception);

        response.status(envelope.httpStatus).json(envelope);
    };


    /** Busca el código en el catálogo; si no existe, cae al genérico. Nunca devuelve undefined. */
    private resolveEntry(code: string): CatalogEntryResponse {
        return RESPONSE_CATALOG[code] ?? RESPONSE_CATALOG[RESPONSE_CODE.INTERNAL_ERROR]!;
    };


    private toEnvelope(exception: unknown): ApiResponse<unknown> {
        if (exception instanceof DomainException) {
            const entry = this.resolveEntry(exception.code);

            // el DETALLE técnico va SOLO al log, nunca a la respuesta
            this.logger.warn(`[${exception.code}] ${exception.detail}`);

            return {
                status: entry.status,
                code: exception.code,
                httpStatus: AllExceptionsFilter.CATEGORY_TO_HTTP[entry.category],
                message: entry.message,
                data: null
            };
        };


        if (exception instanceof HttpException) {
            const httpStatus = exception.getStatus();

            this.logger.warn(`[HTTP ${httpStatus}] ${JSON.stringify(exception.getResponse())}`);

            const entry = this.resolveEntry(RESPONSE_CODE.VALIDATION_ERROR);

            return {
                status: entry.status,
                code: RESPONSE_CODE.VALIDATION_ERROR,
                httpStatus,
                message: entry.message,
                data: null
            };
        };


        this.logger.error(exception);
        const entry = this.resolveEntry(RESPONSE_CODE.INTERNAL_ERROR);

        return {
            status: entry.status,
            code: RESPONSE_CODE.INTERNAL_ERROR,
            httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
            message: entry.message,
            data: null
        };
    };
};