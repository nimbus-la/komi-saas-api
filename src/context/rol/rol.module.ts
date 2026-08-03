import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import {
  SearchAllRolUseCase,
  SearchRolUseCase,
} from "./application";

import { RolRepository } from "./domain/rol.repository";
import { RolController } from "./infrastructure/http/rol.controller";
import { TypeOrmRolRepository } from "./infrastructure/persistence/repository/rol-repository";
import { RolEntity } from "./infrastructure/persistence/models/rol.entity";

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
      useClass: TypeOrmRolRepository,
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
  ],

  exports: [
    RolRepository,
  ],
})
export class RolModule {}