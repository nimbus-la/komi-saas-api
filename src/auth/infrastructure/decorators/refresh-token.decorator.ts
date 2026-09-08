import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

import { RefreshTokenCookie } from "@/infrastructure";


export const RefreshToken = createParamDecorator(
    (_data: unknown, context: ExecutionContext): string | null => {
        const request = context.switchToHttp().getRequest<Request>();

        const fromCookie = RefreshTokenCookie.read(request);

        if (fromCookie !== null) return fromCookie;

        const fromBody = (request.body as { refreshToken?: unknown } | undefined)?.refreshToken;

        return typeof fromBody === 'string' && fromBody.length > 0
            ? fromBody
            : null;
    }
)