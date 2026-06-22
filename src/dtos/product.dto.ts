import { IsString, IsNumber, IsOptional, IsPositive, IsInt } from "class-validator";
import { Type } from "class-transformer";

export class IdParamDto {
    @Type(() => Number)
    @IsInt({ message: "ID must be a valid integer number" })
    @IsPositive({ message: "ID must be a number greater than zero" })
    id?: number;
}

export class CreateProductDto {
    @IsString({ message: "Name is required"})
    name!: string;

    @IsString({ message: "Emoji must be a String"})
    emoji!: string;

    @IsString({ message: "Store is required" })
    store!: string;

    @IsString({ message: "Category is required" })
    category!: string;

    @IsNumber({}, { message: "Price must be a number" })
    @IsPositive({ message: "Price must be greater than zero" })
    currentPrice!: number;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  store!: string;

  @IsOptional()
  @IsString()
  category!: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  currentPrice!: number;

  @IsOptional()
  @IsString()
  emoji!: string;
}

