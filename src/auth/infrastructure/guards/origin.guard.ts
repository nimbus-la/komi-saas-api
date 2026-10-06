import { Request } from "express";

import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { CorsConfig } from "@/interfaces";
import { isOriginAllowed } from "@/infrastructure";
import { ForeignOriginException } from "../../domain";


const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);


@Injectable()
export class OriginGuard implements CanActivate {
    private readonly cors: CorsConfig;

    constructor(configService: ConfigService) {
        this.cors = configService.getOrThrow<CorsConfig>("cors");
    }

    public canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();

        if (SAFE_METHODS.has(request.method)) return true;

        const origin = request.headers.origin;

        // Sin Origin no es un navegador (Postman, curl, el servidor de Next), y el
        // CSRF solo existe en un navegador.
        if (origin === undefined) return true;

        if (isOriginAllowed(this.cors, origin)) return true;

        throw new ForeignOriginException(origin);
    }
}