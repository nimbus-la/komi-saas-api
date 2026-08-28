import {
  UserAggregate,
  UserEmail,
  UserId,
  UserName,
  UserRepository,
  UserResponse,
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

  public async searchById( tenantId: UserTenantId, id: UserId): Promise<UserResponse | null> {
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

  public async searchAggregateById(tenantId: UserTenantId, id: UserId): Promise<UserAggregate | null> {
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
  ): Promise<Paginated<UserResponse>> {
    const [rows, total] = await this.userRepository.findAndCount({
      where: {
        tenantId: tenantId.value,
      },
      skip: (pagination.pageNumber - 1) * pagination.pageSize,
      take: pagination.pageSize,
    });

    return {
      rows: UserMapper.toResponseList(rows),
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
      total,
    };
  }

  public async update( tenantId: UserTenantId, user: UserAggregate): Promise<void> {
    const primitives = user.toPrimitives();

    await this.userRepository.update(
      {
        id: primitives.id,
        tenantId: tenantId.value,
      },
      {
        tenantId: primitives.tenantId,
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
