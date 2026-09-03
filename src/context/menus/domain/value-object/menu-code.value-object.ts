import { VALIDATION_DEFAULTS } from "@/shared";

import { InvalidMenuCodeException } from "../exceptions/menu.exception";

/**
 * Identificador estable de un menú, pensado para que el front lo señale por
 * nombre: `INVENTORY_ITEMS`, `ADMIN_USERS_ROLES`.
 *
 * Existe porque el id es un UUID y el título es texto que cambia. Cuando el
 * front necesita tratar a un menú en particular —sacarlo del sidebar y ponerlo
 * en el navbar, esconderlo, pintarlo distinto— necesita algo con lo que
 * referirse a él que ni sea opaco ni se mueva.
 *
 * Por eso NO se deriva del título ni de la url: si saliera de ahí, renombrar un
 * menú o cambiarle la ruta le cambiaría el código, y lo que el front tuviera
 * anclado se rompería sin que nadie lo note. Se escribe a mano en el seed y no
 * se toca más.
 *
 * A diferencia de RolCode, no hay enum: los menús crecen por SQL y una lista
 * cerrada obligaría a tocar TypeScript para agregar una entrada. Se valida la
 * forma, no el contenido.
 */
export class MenuCode {
    public static readonly MAX_LENGTH = VALIDATION_DEFAULTS.CODE.MAX_LENGTH;

    /** Mayúsculas, dígitos y guión bajo; empieza por letra. */
    private static readonly FORMAT = /^[A-Z][A-Z0-9_]*$/;

    private constructor(
        public readonly value: string,
    ) { }

    public static create(raw: string): MenuCode {
        const value = raw.trim().toUpperCase();

        if (value.length === 0 || value.length > MenuCode.MAX_LENGTH) {
            throw new InvalidMenuCodeException(raw);
        }

        if (!MenuCode.FORMAT.test(value)) {
            throw new InvalidMenuCodeException(raw);
        }

        return new MenuCode(value);
    }

    public equals(other: MenuCode): boolean {
        return this.value === other.value;
    }
}
