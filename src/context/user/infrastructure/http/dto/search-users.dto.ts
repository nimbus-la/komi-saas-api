import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

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
}