import { Module } from '@nestjs/common';

import { AppConfigModule, DatabaseModule } from './shared/infrastructure';
import { TenantModule } from './context/tenants/tenant.module';
import { ProductsModule } from './context/products/products.module';
import { InventoryModule } from './context/inventory/inventory-item.module';
import { BranchModule } from './context/branch/branch.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    InventoryModule,
    TenantModule,
    ProductsModule,
    BranchModule
  ],
})
export class AppModule { }