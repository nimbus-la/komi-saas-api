import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { GetMenuUseCase, UpdateMenuIsNewUseCase } from "./application";
import { MenuRepository } from "./domain";
import { MenuController } from "./infrastructure/http/menu.controller";
import { MenuEntity } from "./infrastructure/persistence/models/menu.entity";
import { MenuRepositoryImpl } from "./infrastructure/persistence/repository/menu.repository.impl";

@Module({
    imports: [
        TypeOrmModule.forFeature([MenuEntity]),
    ],

    controllers: [
        MenuController,
    ],

    providers: [
        {
            provide: MenuRepository,
            useClass: MenuRepositoryImpl,
        },

        {
            provide: GetMenuUseCase,
            useFactory: (repository: MenuRepository) =>
                new GetMenuUseCase(repository),
            inject: [MenuRepository],
        },

        {
            provide: UpdateMenuIsNewUseCase,
            useFactory: (repository: MenuRepository) =>
                new UpdateMenuIsNewUseCase(repository),
            inject: [MenuRepository],
        },
    ],

    exports: [
        MenuRepository,
    ],
})
export class MenusModule { }
