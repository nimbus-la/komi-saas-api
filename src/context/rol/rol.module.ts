import { TypeOrmModule } from "@nestjs/typeorm";
import { CreateRolUseCase, SearchAllRolUseCase, SearchRolUseCase, UpdateRolUseCase } from "./application";
import { RolRepository } from "./domain/rol.respository";
import { RolController } from "./infrastructure/http/rol.controller";
import { RolService } from "./infrastructure/persistence/repository/rol-repository";
import { RolEntity } from "./infrastructure/persistence/models/rol.entity";
import { Module } from "@nestjs/common";

@Module({
    imports: [
        TypeOrmModule.forFeature([RolEntity]),
    ],

    controllers: [
        RolController,
    ],

    providers: [
        {
            provide: RolRepository,
            useClass: RolService,
        },

        {
            provide: CreateRolUseCase,
            useFactory: (repository: RolRepository) =>
                new CreateRolUseCase(repository),
            inject: [RolRepository],
        },

        {
            provide: SearchRolUseCase,
            useFactory: (repository: RolRepository) =>
                new SearchRolUseCase(repository),
            inject: [RolRepository],
        },

        {
            provide: SearchAllRolUseCase,
            useFactory: (repository: RolRepository) =>
                new SearchAllRolUseCase(repository),
            inject: [RolRepository],
        },

        {
            provide: UpdateRolUseCase,
            useFactory: (repository: RolRepository) =>
                new UpdateRolUseCase(repository),
            inject: [RolRepository],
        },
    ],

    exports: [
        RolRepository,
    ],
})
export class RolModule {}