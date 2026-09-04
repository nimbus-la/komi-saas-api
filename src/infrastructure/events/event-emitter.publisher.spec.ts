import { EventEmitter2 } from '@nestjs/event-emitter';
import { PinoLogger } from 'nestjs-pino';

import { DomainEvent } from '@/shared/domain/domain-event';

import { EventEmitterPublisher } from './event-emitter.publisher';


/** El constructor de `DomainEvent` es protegido: los dobles lo abren. */
class StockConsumedStub extends DomainEvent {
    public readonly eventName = 'inventory.stock.consumed';

    public constructor() {
        super();
    };
};

class StockCountedStub extends DomainEvent {
    public readonly eventName = 'inventory.stock.counted';

    public constructor() {
        super();
    };
};


const build = (emitAsync: jest.Mock) => {
    const error = jest.fn();

    const publisher = new EventEmitterPublisher(
        { emitAsync } as unknown as EventEmitter2,
        { setContext: jest.fn(), error } as unknown as PinoLogger
    );

    return { publisher, error };
};



describe('EventEmitterPublisher', () => {
    it('emite cada evento por su nombre', async () => {
        const emitAsync = jest.fn().mockResolvedValue([]);
        const { publisher } = build(emitAsync);

        await publisher.publish([new StockConsumedStub(), new StockCountedStub()]);

        expect(emitAsync).toHaveBeenNthCalledWith(1, 'inventory.stock.consumed', expect.any(StockConsumedStub));
        expect(emitAsync).toHaveBeenNthCalledWith(2, 'inventory.stock.counted', expect.any(StockCountedStub));
    });


    describe('cuando un handler falla', () => {
        const failingFirst = () => jest.fn()
            .mockRejectedValueOnce(new Error('el handler reventó'))
            .mockResolvedValue([]);


        /**
         * Antes se recorrían sin protección: si el primero reventaba, los
         * siguientes no se emitían nunca y nadie se enteraba.
         */
        it('los demás eventos se siguen emitiendo', async () => {
            const emitAsync = failingFirst();
            const { publisher } = build(emitAsync);

            await publisher.publish([new StockConsumedStub(), new StockCountedStub()]);

            expect(emitAsync).toHaveBeenCalledTimes(2);
        });


        /**
         * Lo importante de esta parte: cuando esto corre, la operación de
         * negocio YA se guardó. Dejar subir el error hacía que la petición
         * respondiera 500 por algo que sí ocurrió, y quien reintentara lo
         * hacía dos veces.
         */
        it('el error no se propaga: la operación ya persistida no se desmiente', async () => {
            const { publisher } = build(failingFirst());

            await expect(publisher.publish([new StockConsumedStub()])).resolves.toBeUndefined();
        });


        it('queda constancia con el evento, el error y el payload para rehacerlo', async () => {
            const { publisher, error } = build(failingFirst());
            const event = new StockConsumedStub();

            await publisher.publish([event]);

            expect(error).toHaveBeenCalledTimes(1);
            expect(error).toHaveBeenCalledWith(
                expect.objectContaining({
                    event: 'inventory.stock.consumed',
                    payload: event,
                    err: expect.any(Error),
                }),
                expect.stringContaining('no se pudo procesar'),
            );
        });


        it('un fallo por evento: dos rotos son dos líneas', async () => {
            const { publisher, error } = build(jest.fn().mockRejectedValue(new Error('boom')));

            await publisher.publish([new StockConsumedStub(), new StockCountedStub()]);

            expect(error).toHaveBeenCalledTimes(2);
        });
    });
});
