import { Entity } from './entity';
import { Uuid } from '../value-object/uuid.value-object';
import { generateUUID } from '../value-object/uuid-generator.value-object';


/**
 * Pruebas de la igualdad entre entidades.
 *
 * Es la base de todo el dominio, así que un fallo aquí no se nota en un sitio
 * sino en todos. El caso que motivó estas pruebas era justo ese: `equals`
 * devolvía true al compararse con algo que ni siquiera era una entidad.
 */

class TestId extends Uuid {
    public static create(value: string): TestId { return new TestId(value); }
    public static generate(): TestId { return new TestId(generateUUID()); }
}

/** Un identificador distinto, para comprobar que el tipo también cuenta. */
class OtherId extends Uuid {
    public static create(value: string): OtherId { return new OtherId(value); }
}

class TestEntity extends Entity<TestId> {
    constructor(id: TestId) { super(id); }
}

class OtherEntity extends Entity<OtherId> {
    constructor(id: OtherId) { super(id); }
}


const UUID = '3f1c9b6e-5a72-4d18-8c04-2b9e7a1d6f30';
const OTRO_UUID = 'b7a2c4d8-9e13-4f56-a0b1-2c3d4e5f6a7b';


describe('Entity', () => {
    describe('equals', () => {
        it('es igual a sí misma', () => {
            const entity = new TestEntity(TestId.create(UUID));

            expect(entity.equals(entity)).toBe(true);
        });


        // Identidad, no contenido: son dos instancias distintas en memoria.
        it('es igual a otra instancia con el mismo id', () => {
            const uno = new TestEntity(TestId.create(UUID));
            const dos = new TestEntity(TestId.create(UUID));

            expect(uno.equals(dos)).toBe(true);
        });


        it('no es igual a una entidad con otro id', () => {
            const uno = new TestEntity(TestId.create(UUID));
            const dos = new TestEntity(TestId.create(OTRO_UUID));

            expect(uno.equals(dos)).toBe(false);
        });


        /**
         * El bug que arregló estas pruebas: la comprobación de tipo devolvía true
         * en lugar de false, así que una entidad resultaba igual a cualquier cosa
         * que no fuera una entidad. Cualquier `if (a.equals(b))` con un valor
         * ausente o con un objeto plano entraba por la rama equivocada.
         */
        it.each([
            ['undefined', undefined],
            ['null', null],
            ['un objeto plano con el mismo id', { id: TestId.create(UUID) }],
            ['un texto', UUID],
            ['un número', 42],
            ['un arreglo', []],
        ])('no es igual a %s', (_caso, other) => {
            const entity = new TestEntity(TestId.create(UUID));

            expect(entity.equals(other)).toBe(false);
        });


        // Mismo UUID, entidades de tipos distintos. Lo resuelve el value object,
        // que compara también el tipo del identificador.
        it('no es igual a una entidad de otro tipo con el mismo UUID', () => {
            const test = new TestEntity(TestId.create(UUID));
            const other = new OtherEntity(OtherId.create(UUID));

            expect(test.equals(other)).toBe(false);
        });
    });


    describe('construcción', () => {
        it.each([
            ['null', null],
            ['undefined', undefined],
        ])('rechaza un id %s', (_caso, id) => {
            expect(() => new TestEntity(id as unknown as TestId)).toThrow();
        });


        it('expone el id con getID', () => {
            const id = TestId.generate();

            expect(new TestEntity(id).getID()).toBe(id);
        });
    });
});
