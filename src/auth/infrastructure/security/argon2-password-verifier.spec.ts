import { Logger } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import * as argon2 from 'argon2';

import { Argon2PasswordVerifier } from './argon2-password-verifier';


/**
 * Pruebas del verificador de contraseñas.
 *
 * argon2 va mockeado entero: hashear de verdad tarda cientos de milisegundos por
 * llamada y aquí no interesa si el algoritmo funciona (eso ya es problema de la
 * librería), sino cuándo se lo llama, cuántas veces y qué pasa cuando falla.
 *
 * El grueso de la suite gira alrededor del hash dummy, que es la pieza que ya dio
 * un problema en producción y la que sostiene la defensa contra los ataques por
 * tiempos.
 */
jest.mock('argon2', () => ({
    argon2id: 2,
    hash: jest.fn(),
    verify: jest.fn(),
}));

const hashMock = argon2.hash as unknown as jest.Mock;
const verifyMock = argon2.verify as unknown as jest.Mock;

/** Un hash con pinta de argon2 real. Nunca se verifica de verdad, alcanza con la forma. */
const DUMMY = '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$dummy';

/** Espera a que se vacíen las microtasks y pase un turno del event loop. */
const flush = (): Promise<void> => new Promise((resolve) => { setImmediate(resolve); });


/**
 * Doble del logger. Es una dependencia mas del verificador desde que registra
 * el hash ilegible: un hash corrupto no es una contrasena equivocada.
 */
const createVerifier = (): Argon2PasswordVerifier => new Argon2PasswordVerifier(
    { setContext: jest.fn(), debug: jest.fn(), error: jest.fn() } as unknown as PinoLogger
);


describe('Argon2PasswordVerifier', () => {
    beforeAll(() => {
        // El fallo del hash dummy se loguea con Logger.error y ensucia la salida de jest.
        Logger.overrideLogger(false);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });


    /**
     * Cuándo nace el hash dummy y cuántas veces. Se calcula tarde y una sola vez:
     * tarde para no dejar promesas sueltas al arrancar, una sola vez porque
     * hashear en cada login sería tirar tiempo a la basura.
     */
    describe('cálculo del hash dummy', () => {
        it('no lo calcula en el constructor', () => {
            const verifier = createVerifier();

            expect(verifier).toBeInstanceOf(Argon2PasswordVerifier);
            expect(hashMock).not.toHaveBeenCalled();
        });


        /**
         * Este era el bug: el hash salía disparado desde el constructor y nadie lo
         * esperaba hasta el primer login. Si argon2 fallaba, la promesa quedaba
         * rechazada sin que nadie la atrapara y Node mata el proceso.
         */
        it('no emite unhandledRejection aunque argon2 falle al arrancar', async () => {
            // Se engancha el listener a mano porque un unhandledRejection no hace
            // fallar al test por sí solo, hay que ir a buscarlo.
            const rejections: unknown[] = [];
            const onRejection = (reason: unknown): void => { rejections.push(reason); };

            process.on('unhandledRejection', onRejection);
            hashMock.mockRejectedValue(new Error('argon2 no disponible'));

            const verifier = createVerifier();
            await flush();

            process.off('unhandledRejection', onRejection);

            expect(verifier).toBeInstanceOf(Argon2PasswordVerifier);
            expect(rejections).toEqual([]);
        });


        // Dos llamadas, un solo hash. El verify sí corre las dos veces porque es
        // justamente el que tiene que gastar el tiempo.
        it('lo calcula una sola vez y lo reutiliza entre llamadas', async () => {
            hashMock.mockResolvedValue(DUMMY);
            verifyMock.mockResolvedValue(false);

            const verifier = createVerifier();

            await verifier.verifyAgainstDummy('primera');
            await verifier.verifyAgainstDummy('segunda');

            expect(hashMock).toHaveBeenCalledTimes(1);
            expect(verifyMock).toHaveBeenCalledTimes(2);
        });


        // Dos instancias distintas para comprobar que el valor sale de randomBytes
        // y no de una constante escrita en el código.
        it('lo calcula con argon2id sobre un valor aleatorio', async () => {
            hashMock.mockResolvedValue(DUMMY);
            verifyMock.mockResolvedValue(false);

            await createVerifier().verifyAgainstDummy('x');
            await createVerifier().verifyAgainstDummy('x');

            expect(hashMock).toHaveBeenNthCalledWith(1, expect.any(String), { type: argon2.argon2id });

            const [firstCall, secondCall] = hashMock.mock.calls;

            expect(firstCall?.[0]).not.toBe(secondCall?.[0]);
        });
    });


    /**
     * El método que se llama cuando el usuario no existe. Su contrato es raro a
     * propósito: no devuelve nada, no le importa el resultado y no puede fallar.
     * Lo único que tiene que garantizar es haber tardado.
     */
    describe('verifyAgainstDummy', () => {
        it('nunca lanza cuando el hash dummy falla', async () => {
            hashMock.mockRejectedValue(new Error('argon2 no disponible'));

            const verifier = createVerifier();

            await expect(verifier.verifyAgainstDummy('cualquiera')).resolves.toBeUndefined();
        });


        it('nunca lanza cuando la verificación falla', async () => {
            hashMock.mockResolvedValue(DUMMY);
            verifyMock.mockRejectedValue(new Error('hash corrupto'));

            const verifier = createVerifier();

            await expect(verifier.verifyAgainstDummy('cualquiera')).resolves.toBeUndefined();
        });


        /**
         * Si nos quedáramos con la promesa rechazada, un fallo puntual dejaría este
         * método respondiendo al instante durante toda la vida del proceso. Y ahí ya
         * se puede adivinar qué usuarios existen midiendo cuánto tarda el login.
         */
        it('no cachea el fallo: reintenta el hash en la siguiente llamada', async () => {
            hashMock.mockRejectedValue(new Error('sin memoria'));

            const verifier = createVerifier();

            await verifier.verifyAgainstDummy('primera');
            await verifier.verifyAgainstDummy('segunda');

            expect(hashMock).toHaveBeenCalledTimes(2);
        });


        // La otra cara del test anterior: argon2 pide 64MB y a veces no los
        // consigue. Cuando el problema pasa, la siguiente llamada tiene que volver
        // a funcionar sola, sin reiniciar nada.
        it('se recupera solo cuando el fallo era transitorio', async () => {
            hashMock
                .mockRejectedValueOnce(new Error('sin memoria'))
                .mockResolvedValue(DUMMY);
            verifyMock.mockResolvedValue(false);

            const verifier = createVerifier();

            await verifier.verifyAgainstDummy('primera');
            expect(verifyMock).not.toHaveBeenCalled();

            await verifier.verifyAgainstDummy('segunda');
            expect(verifyMock).toHaveBeenCalledWith(DUMMY, 'segunda');
        });
    });


    /** La verificación de verdad, la que corre cuando el usuario sí existe. */
    describe('verify', () => {
        // Ojo con el orden de los argumentos: argon2.verify recibe primero el hash
        // y después la contraseña, al revés que nuestro puerto.
        it('devuelve true cuando la contraseña coincide', async () => {
            verifyMock.mockResolvedValue(true);

            await expect(createVerifier().verify('plana', DUMMY)).resolves.toBe(true);
            expect(verifyMock).toHaveBeenCalledWith(DUMMY, 'plana');
        });


        it('devuelve false cuando no coincide', async () => {
            verifyMock.mockResolvedValue(false);

            await expect(createVerifier().verify('plana', DUMMY)).resolves.toBe(false);
        });


        // Un hash roto en la base no puede tumbar el login con un 500. Es un
        // intento fallido y punto.
        it('devuelve false cuando el hash almacenado es ilegible', async () => {
            verifyMock.mockRejectedValue(new Error('hash corrupto'));

            await expect(createVerifier().verify('plana', 'basura')).resolves.toBe(false);
        });


        // Los logins normales no tienen por qué pagar el costo de hashear el dummy;
        // ese gasto es solo de la rama del usuario inexistente.
        it('no toca el hash dummy', async () => {
            verifyMock.mockResolvedValue(true);

            await createVerifier().verify('plana', DUMMY);

            expect(hashMock).not.toHaveBeenCalled();
        });
    });
});
