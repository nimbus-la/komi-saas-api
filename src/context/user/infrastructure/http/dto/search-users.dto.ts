import { Type } from "class-transformer";
import { IsInt, IsOptional, Min } from "class-validator";

export class SearchUsersDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageNumber = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize = 20;
}