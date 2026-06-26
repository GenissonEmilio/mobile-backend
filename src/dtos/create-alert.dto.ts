import { IsInt, IsNumber, IsPositive } from "class-validator";
import { Type } from "class-transformer";

export class CreateAlertDto {
  @Type(() => Number)
  @IsInt({ message: "productId must be a valid integer" })
  @IsPositive({ message: "productId must be greater than zero" })
  productId!: number;

  @Type(() => Number)
  @IsNumber({}, { message: "targetPrice must be a valid number" })
  @IsPositive({ message: "targetPrice must be greater than zero" })
  targetPrice!: number;
}
