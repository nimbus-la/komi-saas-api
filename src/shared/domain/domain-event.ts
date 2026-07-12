
/**
 * Base de todo evento de dominio: un HECHO de negocio que ya ocurrió.
 * - eventName: identificador único del hecho (en pasado, con namespace);
 *   es la "dirección" a la que se suscriben los handlers.
 * - occurredOn: cuándo ocurrió.
 * Los eventos son inmutables: todos sus campos son readonly.
 */
export abstract class DomainEvent {
    public abstract readonly eventName: string;
    public readonly occurredOn: Date;

    protected constructor(occurredOn: Date = new Date()) {
        this.occurredOn = occurredOn;
    };
};