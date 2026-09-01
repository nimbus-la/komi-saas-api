import { Session } from './session.aggregate';
import { SessionRevocationReason } from './types';
import { SessionId } from './value-object';


/**
 * Pruebas del agregado de sesión.
 *
 * Aquí viven las reglas que deciden si un refresh token sirve o no, así que un
 * fallo en este archivo no se nota en un endpoint sino en los tres. Las dos que
 * más importan: una sesión revocada no se puede volver a revocar —conservar el
 * motivo original es lo que permite distinguir un cierre de sesión de un robo— y
 * la caducidad se cumple al llegar la hora, no después.
 */

const USER_ID = '33333333-3333-4333-8333-333333333333';
const TENANT_ID = '11111111-1111-4111-8111-111111111111';

const AHORA = new Date('2026-01-01T12:00:00.000Z');
const EN_UNA_SEMANA = new Date('2026-01-08T12:00:00.000Z');


const buildSession = (expiresAt: Date = EN_UNA_SEMANA): Session => Session.create({
    userId: USER_ID,
    tenantId: TENANT_ID,
    refreshTokenHash: 'hash-del-refresh',
    expiresAt,
    ipAddress: '190.24.10.7',
    userAgent: 'Mozilla/5.0 (prueba)',
});


describe('Session', () => {
    describe('create', () => {
        it('copia los datos con los que nace', () => {
            const primitives = buildSession().toPrimitives();

            expect(primitives.userId).toBe(USER_ID);
            expect(primitives.tenantId).toBe(TENANT_ID);
            expect(primitives.refreshTokenHash).toBe('hash-del-refresh');
            expect(primitives.expiresAt).toBe(EN_UNA_SEMANA);
            expect(primitives.ipAddress).toBe('190.24.10.7');
            expect(primitives.userAgent).toBe('Mozilla/5.0 (prueba)');
        });


        /**
         * Nace viva y sin motivo. Si arrancara revocada, o con un motivo puesto, la
         * renovación la leería como un token ya canjeado y daría la alarma de robo
         * en el primer uso.
         */
        it('nace viva, sin motivo y sin sucesora', () => {
            const session = buildSession();
            const primitives = session.toPrimitives();

            expect(session.isRevoked()).toBe(false);
            expect(primitives.revokedAt).toBeNull();
            expect(primitives.revocationReason).toBeNull();
            expect(primitives.replacedBySessionId).toBeNull();
        });


        it('se genera un identificador propio para cada sesión', () => {
            expect(buildSession().getID().value).not.toBe(buildSession().getID().value);
        });


        it('registra el momento en que se creó', () => {
            const antes = Date.now();
            const creada = buildSession().toPrimitives().createdAt.getTime();

            expect(creada).toBeGreaterThanOrEqual(antes);
            expect(creada).toBeLessThanOrEqual(Date.now());
        });


        // La IP y el user agent pueden no llegar: detrás de ciertos clientes no
        // vienen, y eso no impide abrir sesión.
        it('acepta que no haya IP ni user agent', () => {
            const session = Session.create({
                userId: USER_ID,
                tenantId: TENANT_ID,
                refreshTokenHash: 'hash',
                expiresAt: EN_UNA_SEMANA,
                ipAddress: null,
                userAgent: null,
            });

            expect(session.toPrimitives().ipAddress).toBeNull();
            expect(session.toPrimitives().userAgent).toBeNull();
        });
    });


    describe('caducidad', () => {
        it('no está expirada mientras falte tiempo', () => {
            expect(buildSession().isExpired(AHORA)).toBe(false);
        });


        it('está expirada cuando ya pasó la hora', () => {
            const pasada = new Date(EN_UNA_SEMANA.getTime() + 1);

            expect(buildSession().isExpired(pasada)).toBe(true);
        });


        // El límite es inclusivo: al dar la hora exacta ya no sirve. Un test justo
        // en el borde porque es donde se cuela un > por un >=.
        it('está expirada justo en el instante de caducar', () => {
            expect(buildSession().isExpired(EN_UNA_SEMANA)).toBe(true);
        });
    });


    /**
     * isUsable es la conjunción de las dos condiciones. Se recorren las cuatro
     * combinaciones porque basta que una se evalúe al revés para dejar pasar un
     * token que no debería servir.
     */
    describe('isUsable', () => {
        it('sirve cuando está viva y sin caducar', () => {
            expect(buildSession().isUsable(AHORA)).toBe(true);
        });


        it('no sirve si está revocada, aunque no haya caducado', () => {
            const session = buildSession();
            session.revoke(SessionRevocationReason.Logout, AHORA);

            expect(session.isUsable(AHORA)).toBe(false);
        });


        it('no sirve si caducó, aunque no esté revocada', () => {
            expect(buildSession().isUsable(new Date(EN_UNA_SEMANA.getTime() + 1))).toBe(false);
        });


        it('no sirve si está revocada y además caducó', () => {
            const session = buildSession();
            session.revoke(SessionRevocationReason.Logout, AHORA);

            expect(session.isUsable(new Date(EN_UNA_SEMANA.getTime() + 1))).toBe(false);
        });
    });


    describe('revoke', () => {
        it.each([
            SessionRevocationReason.Logout,
            SessionRevocationReason.Rotated,
            SessionRevocationReason.ReuseDetected,
            SessionRevocationReason.Revoked,
        ])('deja la fecha y el motivo %s', (reason) => {
            const session = buildSession();
            session.revoke(reason, AHORA);

            expect(session.isRevoked()).toBe(true);
            expect(session.getRevokedAt()).toBe(AHORA);
            expect(session.getRevocationReason()).toBe(reason);
        });


        /**
         * Revocar dos veces no pisa la primera. Es la regla que sostiene toda la
         * detección de robo: quien renueva mira POR QUÉ se revocó para distinguir
         * un cierre de sesión normal de un refresh ya canjeado. Si el segundo
         * intento sobrescribiera el motivo, un logout acabaría contándose como robo
         * y le cerraría al usuario todas sus sesiones.
         */
        it('conserva el primer motivo y la primera fecha', () => {
            const session = buildSession();
            const despues = new Date(AHORA.getTime() + 60_000);

            session.revoke(SessionRevocationReason.Logout, AHORA);
            session.revoke(SessionRevocationReason.ReuseDetected, despues);

            expect(session.getRevocationReason()).toBe(SessionRevocationReason.Logout);
            expect(session.getRevokedAt()).toBe(AHORA);
        });
    });


    describe('rotateTo', () => {
        it('la marca como canjeada y apunta a su sucesora', () => {
            const session = buildSession();
            const successor = SessionId.generate();

            session.rotateTo(successor, AHORA);

            expect(session.getRevocationReason()).toBe(SessionRevocationReason.Rotated);
            expect(session.getRevokedAt()).toBe(AHORA);
            expect(session.toPrimitives().replacedBySessionId).toBe(successor.value);
        });


        /**
         * Sobre una sesión ya cerrada no hace nada, ni siquiera dejar el puntero.
         *
         * Antes sí lo dejaba: `revoke` salía temprano conservando el motivo, pero
         * la asignación de la sucesora se ejecutaba igual, y quedaba una sesión con
         * motivo LOGOUT apuntando a una sucesora que nunca la reemplazó. En la base
         * no llegaba a verse porque el canje va con un UPDATE condicionado a que
         * siga sin revocar, pero el agregado se contradecía a sí mismo.
         */
        it('no toca una sesión que ya estaba cerrada', () => {
            const session = buildSession();
            session.revoke(SessionRevocationReason.Logout, AHORA);

            session.rotateTo(SessionId.generate(), new Date(AHORA.getTime() + 60_000));

            expect(session.getRevocationReason()).toBe(SessionRevocationReason.Logout);
            expect(session.getRevokedAt()).toBe(AHORA);
            expect(session.toPrimitives().replacedBySessionId).toBeNull();
        });
    });


    /**
     * El agregado va y vuelve de la base por aquí, así que si un campo se pierde
     * en el camino se pierde en silencio: la sesión se lee sin error, solo que sin
     * ese dato.
     */
    describe('toPrimitives / fromPrimitives', () => {
        it('reconstruye una sesión sin perder nada', () => {
            const original = buildSession();
            original.rotateTo(SessionId.generate(), AHORA);

            const primitives = original.toPrimitives();

            expect(Session.fromPrimitives(primitives).toPrimitives()).toEqual(primitives);
        });


        it('conserva el identificador al reconstruirla', () => {
            const original = buildSession();

            expect(Session.fromPrimitives(original.toPrimitives()).getID().value)
                .toBe(original.getID().value);
        });


        // Reconstruir no es crear: una sesión que venía revocada tiene que seguir
        // revocada al leerla, no volver a nacer viva.
        it('una sesión revocada sigue revocada al reconstruirla', () => {
            const original = buildSession();
            original.revoke(SessionRevocationReason.ReuseDetected, AHORA);

            const recuperada = Session.fromPrimitives(original.toPrimitives());

            expect(recuperada.isRevoked()).toBe(true);
            expect(recuperada.getRevocationReason()).toBe(SessionRevocationReason.ReuseDetected);
        });
    });
});
