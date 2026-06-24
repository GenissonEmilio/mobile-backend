import { IsNumber, IsPositive } from "class-validator";
import { Type } from "class-transformer";

export class UpdateAlertDto {
    @Type(() => Number)
    @IsNumber({}, { message: "targetPrice must be a valid number" })
    @IsPositive({ message: "targetPrice must be greater than zero" })
    targetPrice!: number;
}