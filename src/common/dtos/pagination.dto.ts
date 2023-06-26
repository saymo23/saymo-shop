import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {
  @IsOptional()
  @IsPositive()
  //Transformacion
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsPositive()
  @Min(0)
  //Transformacion
  @Type(() => Number)
  offset?: number;
}