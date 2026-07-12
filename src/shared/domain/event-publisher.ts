import { DomainEvent } from "./domain-event";

/** Puerto de publicación de eventos de dominio. La implementación decide el
 *  transporte (in-memory hoy; una cola mañana) sin tocar aplicación ni dominio. */
export abstract class EventPublisher {
    abstract publish(events: ReadonlyArray<DomainEvent>): Promise<void>;
};