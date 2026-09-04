import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { Reflector } from '@nestjs/core';

/**
 * `@nestjs/jwt` solo publica ESM y ts-jest no transpila node_modules, así que
 * cargarlo desde una prueba revienta con "Cannot use import statement outside a
 * module". Se reemplaza entero, igual que hace el spec de argon2 con su librería.
 *
 * De él solo se usan dos cosas: JwtService, que aquí va falseado de todos modos,
 * y TokenExpiredError, del que únicamente importa poder distinguirlo con
 * instanceof. Un par de clases vacías cubren las dos.
 */
jest.mock('@nestjs/jwt', () => ({
    JwtService: class { },
    TokenExpiredError: class TokenExpiredError extends Error { },
}));

import { JwtService, TokenExpiredError } from '@nestjs/jwt';

import { Session, SessionRepository, SessionRevocationReason } from '../../domain';
import { JwtAuthGuard } from './jwt-auth.guard';


/**
 * Pruebas del guard que protege toda la API.
 *
 * El grueso está en la comprobación contra la base. Sin ella el token solo se
 * verificaba criptográficamente, así que cerrar sesión o dar de baja a alguien no
 * tenía efecto hasta que el access token caducara por su cuenta: quince minutos
 * de acceso pleno con la puerta ya cerrada.
 */

const SESSION_ID = '44444444-4444-4444-8444-444444444444';

const payload = {
    sub: '33333333-3333-4333-8333-333333333333',
    tenantId: '11111111-1111-4111-8111-111111111111',
    branchId: null,
    rolScope: 'ADMINISTRATIVE',
    jti: SESSION_ID,
};


/** Sesión viva, con el motivo de revocación que se le indique. */
const buildSession = (reason?: SessionRevocationReason): Session => {
    const session = Session.create({
        userId: payload.sub,
        tenantId: payload.tenantId,
        refreshTokenHash: 'hash',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ipAddress: null,
        userAgent: null,
    });

    if (reason !== undefined) session.revoke(reason);

    return session;
};


const buildContext = (headers: Record<string, unknown> = {}): ExecutionContext => {
    const request = { headers };

    return {
        switchToHttp: () => ({ getRequest: () => request }),
        getHandler: () => undefined,
        getClass: () => undefined,
    } as unknown as ExecutionContext;
};


const buildGuard = (options: {
    isPublic?: boolean;
    session?: Session | null;
    verifyFails?: Error;
} = {}) => {
    const session = 'session' in options ? options.session : buildSession();

    const verifyAsync = options.verifyFails
        ? jest.fn().mockRejectedValue(options.verifyFails)
        : jest.fn().mockResolvedValue(payload);

    const findById = jest.fn().mockResolvedValue(session);

    const guard = new JwtAuthGuard(
        { verifyAsync } as unknown as JwtService,
        { getAllAndOverride: jest.fn().mockReturnValue(options.isPublic ?? false) } as unknown as Reflector,
        { findById } as unknown as SessionRepository,
        { setContext: jest.fn(), debug: jest.fn() } as unknown as PinoLogger,
    );

    return { guard, findById, verifyAsync };
};


const withToken = () => buildContext({ authorization: 'Bearer un.token.valido' });


describe('JwtAuthGuard', () => {
    describe('extracción del token', () => {
        it.each([
            ['sin cabecera', {}],
            ['cabecera vacía', { authorization: '' }],
            ['sin esquema', { authorization: 'un.token.suelto' }],
            ['esquema equivocado', { authorization: 'Basic abc' }],
        ])('rechaza %s', async (_caso, headers) => {
            const { guard } = buildGuard();

            await expect(guard.canActivate(buildContext(headers)))
                .rejects.toBeInstanceOf(UnauthorizedException);
        });


        // El esquema se compara sin distinguir mayúsculas, como manda el RFC 7235.
        it('acepta "bearer" en minúscula', async () => {
            const { guard } = buildGuard();

            await expect(guard.canActivate(buildContext({ authorization: 'bearer un.token' })))
                .resolves.toBe(true);
        });
    });


    describe('verificación de la firma', () => {
        it('rechaza un token con firma inválida', async () => {
            const { guard } = buildGuard({ verifyFails: new Error('invalid signature') });

            await expect(guard.canActivate(withToken()))
                .rejects.toBeInstanceOf(UnauthorizedException);
        });


        it('rechaza un token expirado', async () => {
            const { guard } = buildGuard({
                verifyFails: new TokenExpiredError('jwt expired', new Date()),
            });

            await expect(guard.canActivate(withToken()))
                .rejects.toBeInstanceOf(UnauthorizedException);
        });


        // Sin firma válida no tiene sentido ir a la base: el corte es antes.
        it('no consulta la sesión cuando la firma no vale', async () => {
            const { guard, findById } = buildGuard({ verifyFails: new Error('nope') });

            await expect(guard.canActivate(withToken())).rejects.toThrow();

            expect(findById).not.toHaveBeenCalled();
        });
    });


    /**
     * La parte nueva: que revocar una sesión surta efecto de inmediato sobre los
     * access token que ya se emitieron.
     */
    describe('estado de la sesión', () => {
        it('deja pasar una sesión viva', async () => {
            const { guard, findById } = buildGuard();

            await expect(guard.canActivate(withToken())).resolves.toBe(true);
            expect(findById).toHaveBeenCalledWith(SESSION_ID);
        });


        // Un token firmado con un jti que ya no está en la base no sirve, por más
        // que la firma cuadre.
        it('rechaza cuando la sesión ya no existe', async () => {
            const { guard } = buildGuard({ session: null });

            await expect(guard.canActivate(withToken()))
                .rejects.toBeInstanceOf(UnauthorizedException);
        });


        // Aquí está el arreglo: antes estos tres seguían entrando hasta que el
        // token caducara solo.
        it.each([
            SessionRevocationReason.Logout,
            SessionRevocationReason.Revoked,
            SessionRevocationReason.ReuseDetected,
        ])('rechaza de inmediato una sesión revocada por %s', async (reason) => {
            const { guard } = buildGuard({ session: buildSession(reason) });

            await expect(guard.canActivate(withToken()))
                .rejects.toBeInstanceOf(UnauthorizedException);
        });


        /**
         * ROTATED es la excepción, y es deliberada: renovar no es revocar. El
         * access token emitido con la sesión anterior sigue siendo válido lo que le
         * quede de vida, y cortarlo tumbaría las peticiones que el cliente tuviera
         * en vuelo justo al renovar.
         */
        it('deja pasar una sesión ya canjeada (ROTATED)', async () => {
            const { guard } = buildGuard({
                session: buildSession(SessionRevocationReason.Rotated),
            });

            await expect(guard.canActivate(withToken())).resolves.toBe(true);
        });
    });


    describe('rutas públicas', () => {
        // El login no lleva token; ni se mira la cabecera ni se va a la base.
        it('pasan sin token y sin consultar la sesión', async () => {
            const { guard, findById, verifyAsync } = buildGuard({ isPublic: true });

            await expect(guard.canActivate(buildContext())).resolves.toBe(true);

            expect(verifyAsync).not.toHaveBeenCalled();
            expect(findById).not.toHaveBeenCalled();
        });
    });
});
