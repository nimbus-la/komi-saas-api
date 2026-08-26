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

  public async searchById(id: UserId): Promise<UserResponse | null> {
    const row = await this.userRepository.findOne({
      where: {
        id: id.value,
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

  public async searchAggregateById(id: UserId): Promise<UserAggregate | null> {
    const row = await this.userRepository.findOne({
      where: {
        id: id.value,
      },
    });

    if (!row) {
      return null;
    }

    return UserMapper.toAggregate(row);
  }

  public async searchAll(): Promise<UserResponse[]> {
    const rows = await this.userRepository.find();

    return UserMapper.toResponseList(rows);
  }

  public async update(user: UserAggregate): Promise<void> {
    const primitives = user.toPrimitives();

    await this.userRepository.update(
      {
        id: primitives.id,
      },
      {
        tenantId: primitives.tenantId,
        branchId: primitives.branchId,
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
