import { AggregateRoot } from "@/shared";
import {
  UserAge,
  UserBranchId,
  UserEmail,
  UserFullName,
  UserId,
  UserLastName,
  UserName,
  UserPassword,
  UserPhone,
  UserRolId,
  UserSex,
} from "./value-object";
import { UserCreatedEvent } from "./events/user-created.event";
import { UserPrimitives } from "./types/user-primitives";
import {
  UserAlreadyActiveException,
  UserAlreadyInactiveException,
} from "./exceptions/user-exceptions";

export class UserAggregate extends AggregateRoot<UserId> {
  private branchId: UserBranchId;
  private rolId: UserRolId;
  private userName: UserName;
  private email: UserEmail;
  private password: UserPassword;
  private fullName: UserFullName;
  private lastName: UserLastName;
  private age: UserAge;
  private sex: UserSex;
  private phone: UserPhone;
  private isActive: boolean;
  private createdAt: Date;
  private updatedAt: Date;

  private constructor(
    id: UserId,
    branchId: UserBranchId,
    rolId: UserRolId,
    userName: UserName,
    email: UserEmail,
    password: UserPassword,
    fullName: UserFullName,
    lastName: UserLastName,
    age: UserAge,
    sex: UserSex,
    phone: UserPhone,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id);

    this.branchId = branchId;
    this.rolId = rolId;
    this.userName = userName;
    this.email = email;
    this.password = password;
    this.fullName = fullName;
    this.lastName = lastName;
    this.age = age;
    this.sex = sex;
    this.phone = phone;
    this.isActive = isActive;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  private touch(): void {
    this.updatedAt = new Date();
  }

  public static create(params: {
    branchId: UserBranchId;
    rolId: UserRolId;
    userName: UserName;
    email: UserEmail;
    password: UserPassword;
    fullName: UserFullName;
    lastName: UserLastName;
    age: UserAge;
    sex: UserSex;
    phone: UserPhone;
  }): UserAggregate {
    const now = new Date();

    const user = new UserAggregate(
      UserId.generate(),
      params.branchId,
      params.rolId,
      params.userName,
      params.email,
      params.password,
      params.fullName,
      params.lastName,
      params.age,
      params.sex,
      params.phone,
      true,
      now,
      now,
    );

    user.registerEvent(
      new UserCreatedEvent({
        userId: user.id.value,
        branchId: user.branchId.value,
        rolId: user.rolId.value,
        userName: user.userName.value,
        email: user.email.value,
        fullName: user.fullName.value,
        lastName: user.lastName.value,
        age: user.age.value,
        sex: user.sex.value,
        phone: user.phone.value,
        isActive: user.isActive,
      }),
    );
    return user;
  }

  public toPrimitives(): UserPrimitives {
    return {
      id: this.id.value,
      branchId: this.branchId.value,
      rolId: this.rolId.value,
      userName: this.userName.value,
      email: this.email.value,
      password: this.password.value,
      fullName: this.fullName.value,
      lastName: this.lastName.value,
      age: this.age.value,
      sex: this.sex.value,
      phone: this.phone.value,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public static fromPrimitives(primitives: UserPrimitives): UserAggregate {
    return new UserAggregate(
      UserId.create(primitives.id),
      UserBranchId.create(primitives.branchId),
      UserRolId.create(primitives.rolId),
      UserName.create(primitives.userName),
      UserEmail.create(primitives.email),
      UserPassword.create(primitives.password),
      UserFullName.create(primitives.fullName),
      UserLastName.create(primitives.lastName),
      UserAge.create(primitives.age),
      UserSex.create(primitives.sex),
      UserPhone.create(primitives.phone),
      primitives.isActive,
      primitives.createdAt,
      primitives.updatedAt,
    );
  }

  public update(params: {
    branchId?: UserBranchId;
    rolId?: UserRolId;
    email?: UserEmail;
    userName?: UserName;
    password?: UserPassword;
    fullName?: UserFullName;
    lastName?: UserLastName;
    age?: UserAge;
    sex?: UserSex;
    phone?: UserPhone;
  }): void {
    if (params.branchId) {
      this.branchId = params.branchId;
    }

    if (params.rolId) {
      this.rolId = params.rolId;
    }

    if (params.userName) {
        this.userName = params.userName;
    }
    
    if (params.email) {
      this.email = params.email;
    }

    if (params.password) {
      this.password = params.password;
    }

    if (params.fullName) {
      this.fullName = params.fullName;
    }

    if (params.lastName) {
      this.lastName = params.lastName;
    }

    if (params.age) {
      this.age = params.age;
    }

    if (params.sex) {
      this.sex = params.sex;
    }

    if (params.phone) {
      this.phone = params.phone;
    }

    this.touch();
  }

  public desactivate(): void {
    if (!this.isActive) {
      throw new UserAlreadyInactiveException();
    }

    this.isActive = false;
  }

  public activate(): void {
    if (this.isActive) {
      throw new UserAlreadyActiveException();
    }

    this.isActive = true;
  }
}
