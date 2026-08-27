import { TypeOrmModule } from "@nestjs/typeorm";
import { BranchModule } from "../branch/branch.module";
import { RolModule } from "../rol/rol.module";
import {
  BranchChecker,
  CreateUserUseCase,
  PasswordHasher,
  ReassignUserUseCase,
  RolFinder,
  SearchAllUsersUseCase,
  SearchUserUseCase,
  TenantChecker,
  ToggleUserStatusUseCase,
  UpdateUserUseCase,
} from "./application";
import { UserRepository } from "./domain";
import {
  Argon2PasswordHasher,
  BranchCheckerAdapter,
  RolFinderAdapter,
  TenantCheckerAdapter,
  UserController,
  UserEntity,
  TypeOrmUserRepository,
} from "./infrastructure";
import { Module } from "@nestjs/common";
import { TenantModule } from "../tenants/tenant.module";
import { EventPublisher } from "@/shared";
import { EventEmitterPublisher } from "@/infrastructure";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    TenantModule,
    BranchModule,
    RolModule,
  ],

  controllers: [UserController],

  providers: [
    {
      provide: UserRepository,
      useClass: TypeOrmUserRepository,
    },

    {
      provide: PasswordHasher,
      useClass: Argon2PasswordHasher,
    },

    {
      provide: TenantChecker,
      useClass: TenantCheckerAdapter,
    },

    {
      provide: BranchChecker,
      useClass: BranchCheckerAdapter,
    },

    {
      provide: RolFinder,
      useClass: RolFinderAdapter,
    },

    {
      provide: EventPublisher,
      useClass: EventEmitterPublisher,
    },

    {
      provide: CreateUserUseCase,
      useFactory: (
        repository: UserRepository,
        tenantChecker: TenantChecker,
        branchChecker: BranchChecker,
        rolFinder: RolFinder,
        passwordHasher: PasswordHasher,
        eventPublisher: EventPublisher,
      ) =>
        new CreateUserUseCase(
          repository,
          tenantChecker,
          branchChecker,
          rolFinder,
          passwordHasher,
          eventPublisher,
        ),
      inject: [
        UserRepository,
        TenantChecker,
        BranchChecker,
        RolFinder,
        PasswordHasher,
        EventPublisher,
      ],
    },

    {
      provide: UpdateUserUseCase,
      useFactory: (
        repository: UserRepository,
        passwordHasher: PasswordHasher,
      ) => new UpdateUserUseCase(repository, passwordHasher),
      inject: [UserRepository, PasswordHasher],
    },

    {
      provide: ToggleUserStatusUseCase,
      useFactory: (repository: UserRepository) =>
        new ToggleUserStatusUseCase(repository),
      inject: [UserRepository],
    },

    {
      provide: ReassignUserUseCase,
      useFactory: (
        repository: UserRepository,
        rolFinder: RolFinder,
        branchChecker: BranchChecker,
      ) => new ReassignUserUseCase(repository, rolFinder, branchChecker),
      inject: [UserRepository, RolFinder, BranchChecker],
    },

    {
      provide: SearchUserUseCase,
      useFactory: (
        repository: UserRepository,
      ) => new SearchUserUseCase(repository),
      inject: [
        UserRepository,
        RolFinder,
      ],
    },

    {
      provide: SearchAllUsersUseCase,
      useFactory: (
        repository: UserRepository,
      ) => new SearchAllUsersUseCase(repository),
      inject: [
        UserRepository,
        RolFinder,
      ],
    },
  ],

  exports: [UserRepository],
})
export class UserModule {}
