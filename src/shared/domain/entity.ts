import { Uuid } from "../value-object/uuid.value-object";

export abstract class Entity<ID extends Uuid> {


    protected constructor(
        public readonly id: ID
    ) {
        if (id == null)
            throw new Error('El ID de la entidad no puede ser nulo.');
    };


    public getID(): ID {
        return this.id;
    };


    /**
     * Dos entidades son la misma si comparten identidad, no si comparten datos:
     * una sucursal que cambió de nombre sigue siendo la misma sucursal.
     *
     * La comparación de ids la resuelve el value object, que además exige que sean
     * del mismo tipo, así que un BranchId y un UserId con el mismo UUID no se
     * confunden.
     */
    public equals(other?: unknown): boolean {
        if (this === other) return true;

        // Devolvía true, y con eso cualquier cosa que no fuera una entidad
        // —undefined, un objeto plano, un texto— resultaba igual a todo.
        if (!(other instanceof Entity)) return false;

        return this.id.equals(other.id);
    };
};