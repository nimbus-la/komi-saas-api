import { InvalidUserPasswordException } from "../exceptions/user-exceptions";

export class UserPassword {

    private static readonly MIN_LENGTH = 8;
    private static readonly MAX_LENGTH = 100;

    private constructor(
        public readonly value: string,
    ) {}

    public static create(raw: string): UserPassword {

        const value = raw.trim();

        if (value.length < this.MIN_LENGTH) {
            throw new InvalidUserPasswordException(
                `mínimo ${this.MIN_LENGTH} caracteres`
            );
        }

        if (value.length > this.MAX_LENGTH) {
            throw new InvalidUserPasswordException(
                `máximo ${this.MAX_LENGTH} caracteres`
            );
        }

        return new UserPassword(value);
    }

    public equals(other: UserPassword): boolean {
        return this.value === other.value;
    }
}