import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";

import { DomainEvent, EventPublisher } from "@/shared";

@Injectable()
export class EventEmitterPublisher implements EventPublisher {
    constructor(
        private readonly emitter: EventEmitter2
    ) { };

    public async publish(events: ReadonlyArray<DomainEvent>): Promise<void> {
        for (const event of events) {
            await this.emitter.emitAsync(event.eventName, event);
        };
    };
};