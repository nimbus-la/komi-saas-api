import { UserAggregate, UserEmail, UserId, UserName, UserRepository, UserResponse } from "@/context/user/domain";
import { UserMapper } from "../mappers/user.mapper";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../models/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class UserService implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  public async save(user: UserAggregate): Promise<void> {
    const primitives = user.toPrimitives();

    const row = this.userRepository.create({
      id: primitives.id,
      branchId: primitives.branchId,
      rolId: primitives.rolId,
      userName: primitives.userName,
      email: primitives.email,
      password: primitives.password,
      fullName: primitives.fullName,
      lastName: primitives.lastName,
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
        branchId: primitives.branchId,
        rolId: primitives.rolId,
        userName: primitives.userName,
        email: primitives.email,
        password: primitives.password,
        fullName: primitives.fullName,
        lastName: primitives.lastName,
        age: primitives.age,
        sex: primitives.sex,
        phone: primitives.phone,
        isActive: primitives.isActive,
        updatedAt: new Date(),
      },
    );
  }

  public async existsByEmail(email: UserEmail): Promise<boolean> {
    const count = await this.userRepository
      .createQueryBuilder("user")
      .where("user.user_email ILIKE :email", {
        email: email.value,
      })
      .getCount();

    return count > 0;
  }

  public async existsByUserName(userName: UserName): Promise<boolean> {
    const count = await this.userRepository
      .createQueryBuilder("user")
      .where("user.user_name ILIKE :userName", {
        userName: userName.value,
      })
      .getCount();

    return count > 0;
  }
}
