/**
 * Nivel del menú dentro del sidebar.
 *
 * Es derivable de la profundidad, pero viaja explícito porque el front pinta
 * cada nivel distinto y no tiene por qué contar padres para saber cuál es.
 */
export enum MenuTypeEnum {
    /** Raíz del sidebar. No tiene padre. */
    PRIMARY = "PRIMARY",

    /** Submenú de un primario. */
    SECONDARY = "SECONDARY",

    /** Submenú de un secundario. Último nivel. */
    TERTIARY = "TERTIARY",
}
