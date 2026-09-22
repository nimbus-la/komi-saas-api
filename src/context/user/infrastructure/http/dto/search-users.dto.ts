import { Type } from "class-transformer";

import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from "class-validator";

import { UserSexEnum } from "@/context/user/domain";
import { VALIDATION_DEFAULTS } from "@/shared";

export class SearchUsersDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(VALIDATION_DEFAULTS.PAGINATION.MIN_VALUE)
  pageNumber = VALIDATION_DEFAULTS.PAGINATION.PAGE_NUMBER;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(VALIDATION_DEFAULTS.PAGINATION.MIN_VALUE)
  @Max(VALIDATION_DEFAULTS.PAGINATION.MAX_PAGE_SIZE)
  pageSize = VALIDATION_DEFAULTS.PAGINATION.PAGE_SIZE;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  secondName?: string;

  @IsOptional()
  @IsString()
  firstLastName?: string;

  @IsOptional()
  @IsString()
  secondLastName?: string;

  @IsOptional()
  @IsString()
  userName?: string;

  @IsOptional()
  @IsUUID()
  rolId?: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(UserSexEnum)
  sex?: UserSexEnum;
}