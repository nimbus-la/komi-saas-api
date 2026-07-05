import { Module } from '@nestjs/common';

import { AppConfigModule, DatabaseModule } from './shared/infrastructure';
import { TenantModule } from './context/tenants/tenant.module';
import { InventoryModule } from './context/inventory/inventory-item.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    InventoryModule,
    TenantModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
