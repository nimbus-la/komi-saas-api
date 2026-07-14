/**
 * Error base de la capa de dominio.
 *
 * Toda regla de negocio violada lanza una subclase de esta, nunca un Error
 * genérico ni una excepción del framework. Así la capa de infraestructura
 * puede traducirlas a respuestas HTTP sin acoplar el dominio a NestJS.
 */
export abstract class DomainException extends Error {
    public readonly code: string;
    public readonly detail: string;


    protected constructor(params: { code: string, detail: string }) {
        super(params.detail);

        this.name = this.constructor.name;
        this.code = params.code;
        this.detail = params.detail
    };
};