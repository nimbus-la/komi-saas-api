import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";

import { DataSource, EntityManager } from "typeorm";

import { SeedDataCleaner } from "../../../application/ports/seed-data-cleaner";


/**
 * Borra con SQL directo porque ningún repositorio sabe eliminar un negocio
 * completo, y agregarles ese poder solo para el seed sería peligroso.
 */
@Injectable()
export class TypeOrmSeedDataCleaner implements SeedDataCleaner {
    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
    ) { }


    public async removeTenantsBySlug(slugs: string[]): Promise<void> {
        // En una transacción para no dejar un negocio a medio borrar si algo falla.
        await this.dataSource.transaction(async (manager: EntityManager) => {
            const rows: Array<{ tenant_id: string }> = await manager.query(
                'SELECT tenant_id FROM tenants WHERE tenant_slug = ANY($1)',
                [slugs],
            );

            if (rows.length === 0) {
                return;
            }

            const tenantIds = rows.map((row) => row.tenant_id);

            // El orden sigue las claves foráneas: primero lo que apunta a otras
            // tablas y al final el negocio.
            const statements = [
                'DELETE FROM sessions WHERE tenant_id = ANY($1)',
                'DELETE FROM inventory_movements WHERE tenant_id = ANY($1)',
                'DELETE FROM recipe_ingredients WHERE product_id IN (SELECT product_id FROM product WHERE tenant_id = ANY($1))',
                'DELETE FROM product WHERE tenant_id = ANY($1)',
                'DELETE FROM product_category WHERE tenant_id = ANY($1)',
                'DELETE FROM inventory_branch_configs WHERE inventory_item_id IN (SELECT inventory_item_id FROM inventory_items WHERE tenant_id = ANY($1))',
                'DELETE FROM inventory_batchs WHERE inventory_item_id IN (SELECT inventory_item_id FROM inventory_items WHERE tenant_id = ANY($1))',
                'DELETE FROM inventory_items WHERE tenant_id = ANY($1)',
                'DELETE FROM users WHERE tenant_id = ANY($1)',
                'DELETE FROM branches WHERE tenant_id = ANY($1)',
                'DELETE FROM tenants WHERE tenant_id = ANY($1)',
            ];

            for (const statement of statements) {
                await manager.query(statement, [tenantIds]);
            }
        });
    }
}
