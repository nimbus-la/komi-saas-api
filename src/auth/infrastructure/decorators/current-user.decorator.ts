import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";
import { AuthenticatedUser, RequestWithUser } from "../types";

export const CurrentUser = createParamDecorator(
    (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
        const request = context.switchToHttp().getRequest<RequestWithUser>();

        if (request.user === undefined) {
            throw new InternalServerErrorException(
                'CurrentUser se usó en una ruta que no pasó por el guard de autenticación'
            );
        }

        return request.user
    }
)