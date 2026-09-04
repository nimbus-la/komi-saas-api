import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PinoLogger } from "nestjs-pino";

import { DomainEvent, EventPublisher } from "@/shared";

// Por ruta directa y no desde el barrel `@/infrastructure`, que arrastra el
// módulo de base de datos entero para usar una función pura.
import { sanitize } from "../logging/sanitizer.util";


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
     * Lo importante del `try` viene de que, cuando esto corre, la operación de
     * negocio ya se guardó.
     *
     * Por un lado, un evento que falla no cancela a los siguientes. Antes se
     * recorrían sin protección, así que si el primero reventaba el segundo y el
     * tercero no se emitían nunca y nadie se enteraba.
     *
     * Por otro, el fallo se registra pero no se propaga. Dejarlo subir hacía
     * que la petición respondiera 500 por algo que sí había pasado, como el
     * stock ya movido o el usuario ya creado, y quien reintentaba lo hacía dos
     * veces. Un efecto secundario roto no puede desmentir un hecho ya guardado,
     * pero sí dejar constancia, y de eso se encarga esta línea.
     */
    public async publish(events: ReadonlyArray<DomainEvent>): Promise<void> {
        for (const event of events) {
            try {
                await this.emitter.emitAsync(event.eventName, event);

            } catch (error: unknown) {
                this.logger.error(
                    {
                        event: event.eventName,
                        occurredOn: event.occurredOn,

                        // Se sanea porque un evento arrastra datos del negocio
                        // y este payload se escribe entero para poder rehacerlo.
                        // Sin esto, una contraseña metida en un evento acabaría
                        // en claro en el log.
                        payload: sanitize(event),
                        err: error,
                    },
                    `El evento '${event.eventName}' no se pudo procesar. La operación que lo produjo SÍ se guardó: `
                    + `lo que quedó a medias es su efecto. El payload va adjunto para poder rehacerlo a mano.`,
                );
            };
        };
    };
};
