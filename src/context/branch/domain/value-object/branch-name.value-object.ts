import { DomainException } from "@/shared";

export class InvalidBranchNameException extends DomainException {
    constructor(reason: string){
        super({
            code: '1009',
            detail: `Nombre de tenant inválido: ${reason}.`
        });
    };
};

export class BranchNameAlreadyExistsException extends DomainException {
    constructor(name: string) {
        super({
            code: '1206',
            detail: `El nombre "${name}" ya está registrado.`
        });
    };
};

export class BranchName {
    private static readonly MIN_LENGTH = 2;
    private static readonly MAX_LENGTH = 30;

    private constructor(public readonly value: string) {}

    public static create(raw: string): BranchName {
        const value = raw.trim();

        if (value.length < this.MIN_LENGTH) {
            throw new InvalidBranchNameException(`mínimo ${this.MIN_LENGTH} caracteres`);
        };

        if (value.length > this.MAX_LENGTH) {
            throw new InvalidBranchNameException(`máximo ${this.MAX_LENGTH} caracteres`);
        };

        return new BranchName(value);
    }

    public equals(other: BranchName): boolean {
        return this.value.toLowerCase() === other.value.toLowerCase();
    }
}