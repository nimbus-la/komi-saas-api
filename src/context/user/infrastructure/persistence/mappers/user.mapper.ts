import { UserAggregate, UserResponse } from "@/context/user/domain";
import { UserEntity } from "../models/user.entity";

export class UserMapper {
  public static toResponse(entity: UserEntity): UserResponse {
    return {
      id: entity.id,
      branchId: entity.branchId,
      rolId: entity.rolId,
      userName: entity.userName,
      email: entity.email,
      fullName: entity.fullName,
      lastName: entity.lastName,
      age: entity.age,
      sex: entity.sex,
      phone: entity.phone,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt,
      isActive: entity.isActive,
    };
  }

  public static toAggregate(entity: UserEntity): UserAggregate {
    return UserAggregate.fromPrimitives({
      id: entity.id,
      branchId: entity.branchId,
      rolId: entity.rolId,
      userName: entity.userName,
      email: entity.email,
      password: entity.password,
      fullName: entity.fullName,
      lastName: entity.lastName,
      age: entity.age,
      sex: entity.sex,
      phone: entity.phone,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  public static toResponseList(entities: UserEntity[]): UserResponse[] {
    return entities.map(UserMapper.toResponse);
  }
}
