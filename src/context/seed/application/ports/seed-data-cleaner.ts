/**
 * Borra los negocios de prueba con todo lo que depende de ellos.
 *
 * Es un puerto porque borrar en cascada depende de cómo están armadas las tablas
 * y sus claves foráneas, y eso es asunto de la persistencia.
 */
export abstract class SeedDataCleaner {
    abstract removeTenantsBySlug(slugs: string[]): Promise<void>;
}
