import { inspect } from "node:util";

import { Request, Response } from "express";
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { PinoLogger } from "nestjs-pino";

// Por ruta directa y no desde el barrel `@/shared`: ese índice exporta también
// los value objects, que importan `uuid` (ESM puro) y hacen que Jest no pueda
// cargar este archivo en una prueba unitaria.
import { DomainException } from "@/shared/domain/domain.exception";
import { RESPONSE_CATALOG } from "@/shared/response-catalog";
import { CatalogEntryResponse, ErrorCategory, RESPONSE_CODE } from "@/utils";
import { ApiResponse } from "@/interfaces";
import { createRequestId, RequestWithId } from "./request-id.middleware";



@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    /**
     * `PinoLogger` es de scope TRANSIENT: esta instancia es solo de este
     * filtro, así que fijarle el contexto no se lo cambia a nadie mas.
     *
     * Cada línea que escriba sale ya con el `traceId` de la petición, porque
     * el middleware de `nestjs-pino` abrió ese contexto antes. Por eso los
     * mensajes de aquí ya NO lo llevan escrito a mano: se imprimía dos veces.
     */
    constructor(private readonly logger: PinoLogger) {
        this.logger.setContext(AllExceptionsFilter.name);
    };


    private static readonly CATEGORY_TO_HTTP: Record<ErrorCategory, HttpStatus> = {
        [ErrorCategory.Validation]: HttpStatus.BAD_REQUEST,
        [ErrorCategory.NotFound]: HttpStatus.NOT_FOUND,
        [ErrorCategory.Conflict]: HttpStatus.CONFLICT,
        [ErrorCategory.Unauthorized]: HttpStatus.UNAUTHORIZED,
        [ErrorCategory.Forbidden]: HttpStatus.FORBIDDEN,
        [ErrorCategory.Unavailable]: HttpStatus.SERVICE_UNAVAILABLE,
    };


    /**
     * Qué entrada del catálogo le corresponde a un rechazo del framework.
     *
     * Sin esto todos caían en 1000, así que a quien se quedaba sin token se le
     * respondía "los datos enviados no son válidos", que no describe el caso ni
     * le dice qué hacer.
     */
    private static readonly HTTP_TO_CODE: Partial<Record<number, string>> = {
        [HttpStatus.UNAUTHORIZED]: '1001',
        // Al ser global, el filtro también atiende las rutas que no existen.
        // Sin esta entrada, un 404 respondía "los datos enviados no son
        // válidos", que no es lo que pasó.
        [HttpStatus.NOT_FOUND]: RESPONSE_CODE.NOT_FOUND,
    };


    /** Profundidad suficiente para ver el driverError de TypeORM y sus metadatos. */
    private static readonly INSPECT_DEPTH = 5;


    public catch(exception: unknown, host: ArgumentsHost): void {
        const http = host.switchToHttp();
        const response = http.getResponse<Response>();
        const request = http.getRequest<RequestWithId>();

        // El identificador lo puso `requestIdMiddleware` al entrar la petición,
        // así que es el mismo que ya viajó en el header `X-Request-Id` y el que
        // llevan las demás líneas de log de esta petición. El respaldo cubre el
        // caso de que el filtro se use sin ese middleware delante.
        const traceId = request?.requestId ?? createRequestId();
        const origin = AllExceptionsFilter.describeRequest(request);

        const envelope = this.toEnvelope(exception, traceId, origin);

        response.status(envelope.httpStatus).json(envelope);
    };


    /** Método y ruta, para saber qué petición produjo el error. */
    private static describeRequest(request: Request | undefined): string {
        if (request === undefined) {
            return 'petición no disponible';
        };

        return `${request.method ?? '?'} ${request.originalUrl ?? request.url ?? '?'}`;
    };


    /**
     * Cabecera + el objeto de error ÍNTEGRO. `inspect` atraviesa el
     * `driverError` anidado de TypeORM y saca a la luz `query`, `parameters`,
     * el SQLSTATE, la tabla y la restricción, además del stack.
     */
    private static dump(header: string, exception: unknown): string {
        return `${header}\n${inspect(exception, { depth: AllExceptionsFilter.INSPECT_DEPTH, breakLength: 120 })}`;
    };


    /** Busca el código en el catálogo; si no existe, cae al genérico. Nunca devuelve undefined. */
    private resolveEntry(code: string): CatalogEntryResponse {
        return RESPONSE_CATALOG[code] ?? RESPONSE_CATALOG[RESPONSE_CODE.INTERNAL_ERROR]!;
    };


    private toEnvelope(exception: unknown, traceId: string, origin: string): ApiResponse<unknown> {
        if (exception instanceof DomainException) {
            const entry = this.resolveEntry(exception.code);
            const httpStatus = AllExceptionsFilter.CATEGORY_TO_HTTP[entry.category];

            // Regla de negocio violada: se sabe qué pasó, basta una línea.
            // El DETALLE técnico va SOLO al log, nunca a la respuesta.
            this.logger.warn({ code: exception.code, httpStatus }, `${origin} | ${exception.detail}`);

            return {
                status: entry.status,
                code: exception.code,
                httpStatus,
                message: entry.message,
                content: null,
                traceId
            };
        };


        if (exception instanceof HttpException) {
            const httpStatus = exception.getStatus();
            const code = AllExceptionsFilter.HTTP_TO_CODE[httpStatus] ?? RESPONSE_CODE.VALIDATION_ERROR;
            const entry = this.resolveEntry(code);

            if (httpStatus >= HttpStatus.INTERNAL_SERVER_ERROR) {
                // Un 5xx del framework no es un rechazo esperado: es un fallo
                // nuestro, y necesita el mismo volcado que el resto de errores
                // ajenos al dominio. Sin el stack no hay forma de ubicarlo.
                this.logger.error({ code, httpStatus }, AllExceptionsFilter.dump(origin, exception));
            } else {
                // Un 4xx sí es un rechazo deliberado de un guard o un pipe:
                // el payload de Nest ya dice todo lo que hay que saber.
                this.logger.warn({ code, httpStatus }, `${origin} | ${JSON.stringify(exception.getResponse())}`);
            };

            return {
                status: entry.status,
                code,
                httpStatus,
                message: entry.message,
                content: null,
                traceId
            };
        };


        // Todo lo ajeno al dominio —TypeORM, el driver de Postgres, la red, un
        // bug de JavaScript— cae aquí. El cliente recibe el mensaje genérico;
        // la consola recibe el error ÍNTEGRO: stack, y en el caso de TypeORM
        // también `query`, `parameters` y el `driverError` con su SQLSTATE,
        // tabla y restricción. Sin eso, un 9999 es imposible de diagnosticar.
        this.logger.error(
            { code: RESPONSE_CODE.INTERNAL_ERROR, httpStatus: HttpStatus.INTERNAL_SERVER_ERROR },
            AllExceptionsFilter.dump(origin, exception),
        );

        const entry = this.resolveEntry(RESPONSE_CODE.INTERNAL_ERROR);

        return {
            status: entry.status,
            code: RESPONSE_CODE.INTERNAL_ERROR,
            httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
            message: entry.message,
            content: null,
            traceId
        };
    };
};
