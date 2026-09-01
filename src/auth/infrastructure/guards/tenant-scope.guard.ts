import { Reflector } from "@nestjs/core";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

import { CrossTenantAccessException } from "../../domain";
import { RequestWithUser } from "../types";
import { IS_PUBLIC_KEY } from "../decorators";


/**
 * Impide que un usuario opere sobre un negocio que no es el suyo.
 *
 * Hoy los controladores reciben el tenantId por la petición —unos por la ruta,
 * otros por query, otros dentro del body— y lo pasan al caso de uso tal cual.
 * Nadie lo compara contra el del token, así que con una sesión válida de
 * cualquier negocio se pueden leer y escribir los datos de todos los demás.
 *
 * Este guard cierra eso en un solo sitio: recorre la petición entera, y cualquier
 * tenantId que no coincida con el del token la corta. Vale para los endpoints de
 * hoy y para los que se agreguen mañana sin que haya que acordarse de nada.
 *
 * Es una red de seguridad, no el destino final: lo correcto es que el tenantId
 * salga del token con @CurrentUser y desaparezca de las firmas. Mientras eso se
 * hace controlador por controlador, esto ya deja la puerta cerrada.
 *
 * OJO con lo que NO cubre: los endpoints que identifican el recurso solo por su
 * id, sin mencionar el negocio, no tienen nada que comparar y siguen expuestos.
 * Esos hay que acotarlos en su propia consulta.
 */
@Injectable()
export class TenantScopeGuard implements CanActivate {
    /** El nombre exacto con el que viaja el negocio en toda la API. */
    private static readonly TENANT_KEY = 'tenantId';

    /**
     * Hasta dónde se baja buscando. El guard corre antes que el ValidationPipe,
     * así que el body llega en crudo y conviene ponerle un tope a lo que se
     * recorre en vez de confiar en que venga con buena forma.
     */
    private static readonly MAX_DEPTH = 6;


    constructor(private readonly reflector: Reflector) { }


    public canActivate(context: ExecutionContext): boolean {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass()
        ]);

        if (isPublic) return true;

        const request = context.switchToHttp().getRequest<RequestWithUser>();
        const user = request.user;

        // Sin usuario no hay con qué comparar. No se deja pasar por confianza: si
        // la ruta no es pública, el guard de JWT ya la habrá rechazado antes.
        if (user === undefined) return true;

        for (const source of [request.params, request.query, request.body]) {
            for (const requested of TenantScopeGuard.collectTenantIds(source)) {
                if (requested !== user.tenantId) {
                    throw new CrossTenantAccessException(user.tenantId, requested);
                }
            }
        }

        return true;
    }


    /**
     * Junta todos los tenantId que aparezcan en la estructura, a cualquier nivel.
     *
     * Se baja hasta el fondo a propósito: alcanza con que uno se cuele anidado
     * dentro de un arreglo para que el chequeo no sirva de nada. Solo se miran los
     * valores de texto; cualquier otra cosa bajo esa clave es un payload inválido
     * y el ValidationPipe lo frenará después.
     */
    private static collectTenantIds(value: unknown, depth = 0): string[] {
        if (depth > TenantScopeGuard.MAX_DEPTH || value === null || typeof value !== 'object') {
            return [];
        }

        if (Array.isArray(value)) {
            return value.flatMap((item) => TenantScopeGuard.collectTenantIds(item, depth + 1));
        }

        const found: string[] = [];

        for (const [key, nested] of Object.entries(value)) {
            if (key === TenantScopeGuard.TENANT_KEY && typeof nested === 'string') {
                found.push(nested);
                continue;
            }

            found.push(...TenantScopeGuard.collectTenantIds(nested, depth + 1));
        }

        return found;
    }
}
