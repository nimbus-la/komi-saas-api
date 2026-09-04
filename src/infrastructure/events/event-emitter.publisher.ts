import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PinoLogger } from "nestjs-pino";

import { DomainEvent, EventPublisher } from "@/shared";


@Injectable()
export class EventEmitterPublisher implements EventPublisher {
    constructor(
        private readonly emitter: EventEmitter2,
        private readonly logger: PinoLogger
    ) {
        this.logger.setContext(EventEmitterPublisher.name);
    };


    /**
     * Publica los hechos que ya ocurrieron, cada uno por su cuenta.
     *
     * Los dos detalles importantes están en el `try`, y los dos vienen del
     * mismo sitio: cuando esto corre, la operación de negocio YA se guardó.
     *
     * 1. Un evento que falla no cancela a los siguientes. Antes se recorrían
     *    sin protección, así que si el primero reventaba, el segundo y el
     *    tercero no se emitían nunca y nadie se enteraba.
     *
     * 2. El fallo se registra y no se propaga. Dejarlo subir hacía que la
     *    petición respondiera 500 por algo que sí ocurrió: el stock movido, el
     *    usuario creado. El cliente veía un fallo, reintentaba, y lo hacía dos
     *    veces. Un efecto secundario roto no puede desmentir un hecho ya
     *    persistido; lo que puede es dejar constancia, y eso es esta línea.
     */
    public async publish(events: ReadonlyArray<DomainEvent>): Promise<void> {
        for (const event of events) {
            try {
                await this.emitter.emitAsync(event.eventName, event);

            } catch (error: unknown) {
                this.logger.error(
                    { event: event.eventName, occurredOn: event.occurredOn, payload: event, err: error },
                    `El evento '${event.eventName}' no se pudo procesar. La operación que lo produjo SÍ se guardó: `
                    + `lo que quedó a medias es su efecto. El payload va adjunto para poder rehacerlo a mano.`,
                );
            };
        };
    };
};
