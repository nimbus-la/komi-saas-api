import { PinoLogger } from 'nestjs-pino';

import { StockConsumedEvent } from '@/context/inventory/domain/events/stock-consumed.event';

import { RecordMovementUseCase } from '../../../application';
import { StockMovementHandlers } from './stock-movement.handlers';


const consumedEvent = (consumedBatches: unknown): StockConsumedEvent => new StockConsumedEvent({
    itemId: 'item-1',
    tenantId: 'tenant-42',
    branchId: 'branch-7',
    quantity: '5',
    consumedBatches: consumedBatches as never,
} as never);


const oneBatch = [{
    batchId: 'batch-1',
    quantity: '5',
    unitCostAmount: '1000',
    unitCostCurrency: 'COP',
}];


const build = (execute: jest.Mock) => {
    const error = jest.fn();

    const handlers = new StockMovementHandlers(
        { execute } as unknown as RecordMovementUseCase,
        { setContext: jest.fn(), error } as unknown as PinoLogger
    );

    return { handlers, error };
};



describe('StockMovementHandlers', () => {
    it('registra un movimiento por cada lote consumido', async () => {
        const execute = jest.fn().mockResolvedValue(undefined);
        const { handlers } = build(execute);

        await handlers.onStockConsumed(consumedEvent([...oneBatch, { ...oneBatch[0], batchId: 'batch-2' }]));

        expect(execute).toHaveBeenCalledTimes(2);
    });


    describe('cuando el registro del movimiento falla', () => {
        it('deja constancia de auditoría incompleta sin tumbar la operación', async () => {
            const { handlers, error } = build(jest.fn().mockRejectedValue(new Error('la base no responde')));

            await expect(handlers.onStockConsumed(consumedEvent(oneBatch))).resolves.toBeUndefined();

            expect(error).toHaveBeenCalledWith(
                expect.objectContaining({
                    event: 'inventory.stock.consumed',
                    failedMovements: expect.arrayContaining([expect.objectContaining({ batchId: 'batch-1' })]),
                    err: expect.any(Error),
                }),
                expect.stringContaining('[AUDITORIA INCOMPLETA]'),
            );
        });
    });


    /**
     * Los movimientos y el evento se escriben enteros para poder rehacer la
     * fila, asi que pasan por la misma lista negra que el cuerpo de una
     * peticion.
     */
    it('lo que se registra va saneado', async () => {
        const { handlers, error } = build(jest.fn().mockRejectedValue(new Error('la base no responde')));

        const event = consumedEvent([{ ...oneBatch[0], password: 'mi-clave' }]);

        await handlers.onStockConsumed(event);

        expect(JSON.stringify(error.mock.calls[0]![0])).not.toContain('mi-clave');
    });


    /**
     * El fallo que motivó la parte: el armado del payload estaba FUERA del
     * try. Un evento sin su lista de lotes reventaba el `.map` antes de
     * cualquier `catch`, el error subía hasta el publicador y de ahí a la
     * petición, que respondía 500 con el stock ya movido.
     */
    describe('cuando el evento llega mal formado', () => {
        it('no propaga el error: lo registra', async () => {
            const { handlers, error } = build(jest.fn());

            await expect(handlers.onStockConsumed(consumedEvent(undefined))).resolves.toBeUndefined();

            expect(error).toHaveBeenCalledWith(
                expect.objectContaining({ event: 'inventory.stock.consumed', err: expect.any(Error) }),
                expect.stringContaining('[AUDITORIA INCOMPLETA]'),
            );
        });


        /**
         * Sin ningún movimiento que adjuntar, lo único que permite rehacer el
         * registro a mano es el evento entero.
         */
        it('adjunta el evento completo, que es lo único que queda', async () => {
            const { handlers, error } = build(jest.fn());

            await handlers.onStockConsumed(consumedEvent(undefined));

            expect(error).toHaveBeenCalledWith(
                expect.objectContaining({
                    // Una COPIA saneada del evento: se compara el contenido.
                    payload: expect.objectContaining({ itemId: 'item-1', tenantId: 'tenant-42' }),
                    failedMovements: [],
                }),
                expect.any(String),
            );
        });


        it('no intenta registrar nada', async () => {
            const execute = jest.fn();
            const { handlers } = build(execute);

            await handlers.onStockConsumed(consumedEvent(undefined));

            expect(execute).not.toHaveBeenCalled();
        });
    });
});
