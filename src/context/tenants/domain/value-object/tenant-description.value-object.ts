import { DomainException } from "@/shared";

export class InvalidTenantDescriptionException extends DomainException {
    constructor(reason: string) {
        super({
            code: '1007',
            detail: `Descripción de tenant inválida: ${reason}.`
        });
    };
};  

export class TenantDescription {
    private static readonly MAX_LENGTH = 255
    
    private constructor(public readonly value: string) { }; 

    public static create(raw: string): TenantDescription {
        const value = raw.trim();
    
        if (value.length > this.MAX_LENGTH) {
            throw new InvalidTenantDescriptionException(`máximo ${this.MAX_LENGTH} caracteres`);
        };

        return new TenantDescription(value);
    };

    public equals(other: TenantDescription): boolean {
        return this.value === other.value;
    };
}; 
