import { InvalidTenantDescriptionException } from "../exceptions/tenant-exceptions";


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
