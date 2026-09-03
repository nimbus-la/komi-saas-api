/**
 * Límites de validación por defecto, compartidos por las DTOs (la entrada HTTP)
 * y los objetos de valor del dominio.
 *
 * Existe porque el mismo límite se estaba escribiendo dos veces: la DTO por un
 * lado y el objeto de valor por el otro. Cuando esos dos números se
 * desincronizan, la petición pasa la validación de entrada y termina
 * rechazándose abajo, en el dominio, así que el cliente recibe el error tarde y
 * con otra forma en vez de un 400 limpio.
 *
 * Son valores por defecto, no una obligación: un contexto con una regla propia
 * (el userName, el teléfono) declara la suya y no usa estas.
 */
export const VALIDATION_DEFAULTS = {

    /**
     * Longitud de un nombre legible por humanos. El mínimo descarta el nombre
     * de una sola letra; el máximo es holgado a propósito, para no pelear con
     * nombres compuestos.
     */
    NAME: {
        MIN_LENGTH: 2,
        MAX_LENGTH: 120,
    },

    /**
     * Código estable con el que el front señala una entrada de un catálogo
     * (hoy, el menu_code del sidebar). Holgado a propósito: son códigos
     * legibles y compuestos, del estilo ADMIN_USERS_ROLES, no siglas.
     */
    CODE: {
        MAX_LENGTH: 60,
    },

    /** Paginación de los listados. */
    PAGINATION: {
        PAGE_NUMBER: 1,
        PAGE_SIZE: 20,
        /** Ni página 0 ni tamaño de página 0: el listado siempre pide algo. */
        MIN_VALUE: 1,
        /**
         * Techo del tamaño de página. Sin él, el pageSize de la petición baja
         * tal cual al take de la consulta, así que un ?pageSize=100000 se lleva
         * la tabla entera del tenant en una sola respuesta: la base la
         * materializa, el proceso la mapea y la serializa, y el costo lo elige
         * quien llama, no el servidor.
         *
         * 100 es holgado para cualquier pantalla real y deja la petición
         * abusiva en un 400 limpio en vez de en una consulta pesada.
         */
        MAX_PAGE_SIZE: 100,
    },

} as const;
