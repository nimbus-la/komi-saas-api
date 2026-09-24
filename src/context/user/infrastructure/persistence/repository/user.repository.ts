import {
  UserAggregate,
  UserEmail,
  UserId,
  UserName,
  UserRepository,
  UserResponse,
  UserSearchParams,
  UserTenantId,
} from "@/context/user/domain";
import { UserMapper } from "../mappers/user.mapper";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../models/user.entity";
import { Repository } from "typeorm";
import { Paginated, Pagination } from "@/interfaces";

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  public async save(user: UserAggregate): Promise<void> {
    const primitives = user.toPrimitives();

    const row = this.userRepository.create({
      id: primitives.id,
      tenantId: primitives.tenantId,
      branchId: primitives.branchId,
      rolId: primitives.rolId,
      rolName: primitives.rolName,
      rolScope: primitives.rolScope,
      userName: primitives.userName,
      email: primitives.email,
      password: primitives.password,
      firstName: primitives.firstName,
      secondName: primitives.secondName,
      firstLastName: primitives.firstLastName,
      secondLastName: primitives.secondLastName,
      age: primitives.age,
      sex: primitives.sex,
      phone: primitives.phone,
      isActive: primitives.isActive,
      createdAt: primitives.createdAt,
      updatedAt: primitives.updatedAt,
    });

    await this.userRepository.save(row);
  }

  public async searchById(
    tenantId: UserTenantId,
    id: UserId,
  ): Promise<UserResponse | null> {
    const row = await this.userRepository.findOne({
      where: {
        id: id.value,
        tenantId: tenantId.value,
      },
    });

    if (!row) {
      return null;
    }

    return UserMapper.toResponse(row);
  }

  public async searchAggregateByUserName(
    tenantId: UserTenantId,
    userName: UserName,
  ): Promise<UserAggregate | null> {
    const row = await this.userRepository.findOne({
      where: {
        tenantId: tenantId.value,
        userName: userName.value,
      },
    });

    if (!row) {
      return null;
    }

    return UserMapper.toAggregate(row);
  }

  public async searchAggregateById(
    tenantId: UserTenantId,
    id: UserId,
  ): Promise<UserAggregate | null> {
    const row = await this.userRepository.findOne({
      where: {
        tenantId: tenantId.value,
        id: id.value,
      },
    });

    if (!row) {
      return null;
    }

    return UserMapper.toAggregate(row);
  }

  public async searchAll(
    tenantId: UserTenantId,
    pagination: Pagination,
    params: UserSearchParams,
  ): Promise<Paginated<UserResponse>> {
    const query = this.userRepository
      .createQueryBuilder("user")
      .where("user.tenant_id = :tenantId", {
        tenantId: tenantId.value,
      });

    if (params.firstName !== undefined) {
      query.andWhere("LOWER(user.user_first_name) LIKE LOWER(:firstName)", {
        firstName: `%${params.firstName}%`,
      });
    }

    if (params.secondName !== undefined) {
      query.andWhere("LOWER(user.user_second_name) LIKE LOWER(:secondName)", {
        secondName: `%${params.secondName}%`,
      });
    }

    if (params.firstLastName !== undefined) {
      query.andWhere(
        "LOWER(user.user_first_last_name) LIKE LOWER(:firstLastName)",
        {
          firstLastName: `%${params.firstLastName}%`,
        },
      );
    }

    if (params.secondLastName !== undefined) {
      query.andWhere(
        "LOWER(user.user_second_last_name) LIKE LOWER(:secondLastName)",
        {
          secondLastName: `%${params.secondLastName}%`,
        },
      );
    }

    if (params.userName !== undefined) {
      query.andWhere("LOWER(user.user_name) LIKE LOWER(:userName)", {
        userName: `%${params.userName}%`,
      });
    }

    if (params.rolId !== undefined) {
      query.andWhere("user.rol_id = :rolId", {
        rolId: params.rolId,
      });
    }

    if (params.branchId !== undefined) {
      query.andWhere("user.branch_id = :branchId", {
        branchId: params.branchId,
      });
    }

    if (params.isActive !== undefined) {
      query.andWhere("user.user_is_active = :isActive", {
        isActive: params.isActive,
      });
    }

    if (params.sex !== undefined) {
      query.andWhere("user.user_sex = :sex", {
        sex: params.sex,
      });
    }

    query
      .orderBy("user.user_created_at", "DESC")
      .addOrderBy("user.user_id", "DESC")
      .skip((pagination.pageNumber - 1) * pagination.pageSize)
      .take(pagination.pageSize);

    const [rows, total] = await query.getManyAndCount();

    return {
      rows: UserMapper.toResponseList(rows),
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
      total,
    };
  }

  public async update(
    tenantId: UserTenantId,
    user: UserAggregate,
  ): Promise<void> {
    const primitives = user.toPrimitives();

    await this.userRepository.update(
      {
        id: primitives.id,
        tenantId: tenantId.value,
      },
      {
        // El tenantId no se escribe: ya es el filtro del WHERE y un usuario no
        // cambia de negocio. Dejarlo en el SET sería la única vía para moverlo.
        branchId: primitives.branchId,
        rolName: primitives.rolName,
        rolId: primitives.rolId,
        rolScope: primitives.rolScope,
        userName: primitives.userName,
        email: primitives.email,
        password: primitives.password,
        firstName: primitives.firstName,
        secondName: primitives.secondName,
        firstLastName: primitives.firstLastName,
        secondLastName: primitives.secondLastName,
        age: primitives.age,
        sex: primitives.sex,
        phone: primitives.phone,
        isActive: primitives.isActive,
        updatedAt: new Date(),
      },
    );
  }

  public async existsByEmail(
    tenantId: UserTenantId,
    email: UserEmail,
    exceptId?: UserId,
  ): Promise<boolean> {
    const query = this.userRepository
      .createQueryBuilder("user")
      .where("user.tenant_id = :tenantId", {
        tenantId: tenantId.value,
      })
      .andWhere("LOWER(user.user_email) = LOWER(:email)", {
        email: email.value,
      });

    if (exceptId) {
      query.andWhere("user.user_id != :exceptId", {
        exceptId: exceptId.value,
      });
    }

    const count = await query.getCount();

    return count > 0;
  }

  public async existsByUserName(
    tenantId: UserTenantId,
    userName: UserName,
    exceptId?: UserId,
  ): Promise<boolean> {
    const query = this.userRepository
      .createQueryBuilder("user")
      .where("user.tenant_id = :tenantId", {
        tenantId: tenantId.value,
      })
      .andWhere("LOWER(user.user_name) = LOWER(:userName)", {
        userName: userName.value,
      });

    if (exceptId) {
      query.andWhere("user.user_id != :exceptId", {
        exceptId: exceptId.value,
      });
    }

    const count = await query.getCount();

    return count > 0;
  }
}
