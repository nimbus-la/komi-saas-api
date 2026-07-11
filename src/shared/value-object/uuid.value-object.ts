import { validate as IsUUID } from 'uuid';
import { DomainException } from '../domain/domain.exception';


export class InvalidUuidException extends DomainException {
    constructor(value: string) {
        super({
            code: '1003',
            detail: `El valor "${value}" no es un UUID válido.`
        });
    };
};


export abstract class Uuid {
    public readonly value: string;

    protected constructor(value: string) {
        if (!value || !IsUUID(value)) {
            throw new InvalidUuidException(value);
        };

        this.value = value;
    };


    public equals(other: Uuid): boolean {
        return this.value === other.value && this.constructor === other.constructor;
    };


    public toString(): string {
        return this.value;
    };
};