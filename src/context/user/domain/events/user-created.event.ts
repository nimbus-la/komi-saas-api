import { DomainEvent } from "@/shared";
import { UserSexEnum } from "../types";
import { UserCreatedProps } from "../types/user-event";

export class UserCreatedEvent extends DomainEvent {
  public readonly eventName = "user.created";

  public readonly userId: string;
  public readonly tenantId: string;
  public readonly branchId: string | null;
  public readonly rolId: string;
  public readonly rolScope: string;
  public readonly userName: string;
  public readonly email: string;
  public readonly fullName: string;
  public readonly lastName: string;
  public readonly age: Date;
  public readonly sex: UserSexEnum;
  public readonly phone: string;
  public readonly isActive: boolean;

  constructor(props: UserCreatedProps) {
    super();

    this.userId = props.userId;
    this.tenantId = props.tenantId;
    this.branchId = props.branchId;
    this.rolId = props.rolId;
    this.rolScope = props.rolScope;
    this.userName = props.userName;
    this.email = props.email;
    this.fullName = props.fullName;
    this.lastName = props.lastName;
    this.age = props.age;
    this.sex = props.sex;
    this.phone = props.phone;
    this.isActive = props.isActive;
  }
}