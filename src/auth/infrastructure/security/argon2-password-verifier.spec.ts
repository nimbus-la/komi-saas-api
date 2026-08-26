import { Logger } from '@nestjs/common';
import * as argon2 from 'argon2';

import { Argon2PasswordVerifier } from './argon2-password-verifier';


jest.mock('argon2', () => ({
    argon2id: 2,
    hash: jest.fn(),
    verify: jest.fn(),
}));

const hashMock = argon2.hash as unknown as jest.Mock;
const verifyMock = argon2.verify as unknown as jest.Mock;

const DUMMY = '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$dummy';

/** Espera a que se vacíen las microtasks y pase un turno del event loop. */
const flush = (): Promise<void> => new Promise((resolve) => { setImmediate(resolve); });


describe('Argon2PasswordVerifier', () => {
    beforeAll(() => {
        // El fallo del hash dummy se loguea con Logger.error y ensucia la salida de jest.
        Logger.overrideLogger(false);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });


    describe('cálculo del hash dummy', () => {
        it('no lo calcula en el constructor', () => {
            const verifier = new Argon2PasswordVerifier();

            expect(verifier).toBeInstanceOf(Argon2PasswordVerifier);
            expect(hashMock).not.toHaveBeenCalled();
        });


        /**
         * Este era el bug: el hash salía disparado desde el constructor y nadie lo
         * esperaba hasta el primer login. Si argon2 fallaba, la promesa quedaba
         * rechazada sin que nadie la atrapara y Node mata el proceso.
         */
        it('no emite unhandledRejection aunque argon2 falle al arrancar', async () => {
            const rejections: unknown[] = [];
            const onRejection = (reason: unknown): void => { rejections.push(reason); };

            process.on('unhandledRejection', onRejection);
            hashMock.mockRejectedValue(new Error('argon2 no disponible'));

            const verifier = new Argon2PasswordVerifier();
            await flush();

            process.off('unhandledRejection', onRejection);

            expect(verifier).toBeInstanceOf(Argon2PasswordVerifier);
            expect(rejections).toEqual([]);
        });


        it('lo calcula una sola vez y lo reutiliza entre llamadas', async () => {
            hashMock.mockResolvedValue(DUMMY);
            verifyMock.mockResolvedValue(false);

            const verifier = new Argon2PasswordVerifier();

            await verifier.verifyAgainstDummy('primera');
            await verifier.verifyAgainstDummy('segunda');

            expect(hashMock).toHaveBeenCalledTimes(1);
            expect(verifyMock).toHaveBeenCalledTimes(2);
        });


        it('lo calcula con argon2id sobre un valor aleatorio', async () => {
            hashMock.mockResolvedValue(DUMMY);
            verifyMock.mockResolvedValue(false);

            await new Argon2PasswordVerifier().verifyAgainstDummy('x');
            await new Argon2PasswordVerifier().verifyAgainstDummy('x');

            expect(hashMock).toHaveBeenNthCalledWith(1, expect.any(String), { type: argon2.argon2id });

            const [firstCall, secondCall] = hashMock.mock.calls;

            expect(firstCall?.[0]).not.toBe(secondCall?.[0]);
        });
    });


    describe('verifyAgainstDummy', () => {
        it('nunca lanza cuando el hash dummy falla', async () => {
            hashMock.mockRejectedValue(new Error('argon2 no disponible'));

            const verifier = new Argon2PasswordVerifier();

            await expect(verifier.verifyAgainstDummy('cualquiera')).resolves.toBeUndefined();
        });


        it('nunca lanza cuando la verificación falla', async () => {
            hashMock.mockResolvedValue(DUMMY);
            verifyMock.mockRejectedValue(new Error('hash corrupto'));

            const verifier = new Argon2PasswordVerifier();

            await expect(verifier.verifyAgainstDummy('cualquiera')).resolves.toBeUndefined();
        });


        /**
         * Si nos quedáramos con la promesa rechazada, un fallo puntual dejaría este
         * método respondiendo al instante durante toda la vida del proceso. Y ahí ya
         * se puede adivinar qué usuarios existen midiendo cuánto tarda el login.
         */
        it('no cachea el fallo: reintenta el hash en la siguiente llamada', async () => {
            hashMock.mockRejectedValue(new Error('sin memoria'));

            const verifier = new Argon2PasswordVerifier();

            await verifier.verifyAgainstDummy('primera');
            await verifier.verifyAgainstDummy('segunda');

            expect(hashMock).toHaveBeenCalledTimes(2);
        });


        it('se recupera solo cuando el fallo era transitorio', async () => {
            hashMock
                .mockRejectedValueOnce(new Error('sin memoria'))
                .mockResolvedValue(DUMMY);
            verifyMock.mockResolvedValue(false);

            const verifier = new Argon2PasswordVerifier();

            await verifier.verifyAgainstDummy('primera');
            expect(verifyMock).not.toHaveBeenCalled();

            await verifier.verifyAgainstDummy('segunda');
            expect(verifyMock).toHaveBeenCalledWith(DUMMY, 'segunda');
        });
    });


    describe('verify', () => {
        it('devuelve true cuando la contraseña coincide', async () => {
            verifyMock.mockResolvedValue(true);

            await expect(new Argon2PasswordVerifier().verify('plana', DUMMY)).resolves.toBe(true);
            expect(verifyMock).toHaveBeenCalledWith(DUMMY, 'plana');
        });


        it('devuelve false cuando no coincide', async () => {
            verifyMock.mockResolvedValue(false);

            await expect(new Argon2PasswordVerifier().verify('plana', DUMMY)).resolves.toBe(false);
        });


        it('devuelve false cuando el hash almacenado es ilegible', async () => {
            verifyMock.mockRejectedValue(new Error('hash corrupto'));

            await expect(new Argon2PasswordVerifier().verify('plana', 'basura')).resolves.toBe(false);
        });


        it('no toca el hash dummy', async () => {
            verifyMock.mockResolvedValue(true);

            await new Argon2PasswordVerifier().verify('plana', DUMMY);

            expect(hashMock).not.toHaveBeenCalled();
        });
    });
});
