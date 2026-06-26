import { IsBoolean, IsNumber, IsOptional, IsPositive } from "class-validator";
import { Type } from "class-transformer";

export class UpdateAlertDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "targetPrice must be a valid number" })
  @IsPositive({ message: "targetPrice must be greater than zero" })
  targetPrice?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: "isActive must be a boolean" })
  isActive?: boolean;
}
