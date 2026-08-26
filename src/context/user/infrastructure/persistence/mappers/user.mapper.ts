import { UserAggregate, UserResponse } from "@/context/user/domain";
import { UserEntity } from "../models/user.entity";

export class UserMapper {
  public static toResponse(entity: UserEntity): UserResponse {
    return {
      id: entity.id,
      tenantId: entity.tenantId,
      branchId: entity.branchId,
      rolId: entity.rolId,
      rolScope: entity.rolScope,
      userName: entity.userName,
      email: entity.email,
      firstName: entity.firstName,  
      secondName: entity.secondName,
      firstLastName: entity.firstLastName,
      secondLastName: entity.secondLastName,
      age: entity.age,
      sex: entity.sex,
      phone: entity.phone,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      isActive: entity.isActive,
    };
  }

  public static toAggregate(entity: UserEntity): UserAggregate {
    return UserAggregate.fromPrimitives({
      id: entity.id,
      tenantId: entity.tenantId,
      branchId: entity.branchId,
      rolId: entity.rolId,
      rolScope: entity.rolScope,
      userName: entity.userName,
      email: entity.email,
      password: entity.password,
      firstName: entity.firstName,
      secondName: entity.secondName,
      firstLastName: entity.firstLastName,
      secondLastName: entity.secondLastName,
      age: entity.age,
      sex: entity.sex,
      phone: entity.phone,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  public static toResponseList(entities: UserEntity[]): UserResponse[] {
    return entities.map((entity) => UserMapper.toResponse(entity));
  }
}
