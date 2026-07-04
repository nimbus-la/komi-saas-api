import { DomainException } from "@/shared";

export class InvalidTenantSlugException extends DomainException {
    constructor(reason: string) {
        super({
            code: '1006',
            detail: `Slug de tenant inválido: ${reason}.`
        });
    };
};

export class TenantSlugAlreadyExistsException extends DomainException { 
    constructor(slug: string) {
        super({
            code: '1203',
            detail: `El slug "${slug}" ya esta registrado.`
        });
    };
};

export class TenantSlug {
    private static readonly MIN_LENGTH = 3;
    private static readonly MAX_LENGTH = 100;

    private constructor(public readonly value: string) { };

    public static create(raw: string): TenantSlug {
        const value = raw.trim();
    
        if (value.length < this.MIN_LENGTH) {
            throw new InvalidTenantSlugException(`mínimo ${this.MIN_LENGTH} caracteres`);
        };

        if (value.length > this.MAX_LENGTH) {
            throw new InvalidTenantSlugException(`máximo ${this.MAX_LENGTH} caracteres`);
        };

        const pattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
        if (!pattern.test(value)) {
            throw new InvalidTenantSlugException('solo se permiten letras minúsculas, números y guiones medios');
        };

        return new TenantSlug(value);
    };

    public equals(other: TenantSlug): boolean {
        return this.value === other.value;
    };
};