import { Request } from "express";
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import { SessionCookies } from "../http/session-cookies";


export const RefreshToken = createParamDecorator(
    (_data: unknown, context: ExecutionContext): string | null => {
        return SessionCookies.readRefresh(context.switchToHttp().getRequest<Request>());
    }
)