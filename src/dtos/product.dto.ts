import {
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from "class-validator";
import { Type } from "class-transformer";

export class IdParamDto {
    @Type(() => Number)
    @IsInt({ message: "ID must be a valid integer number" })
    @IsPositive({ message: "ID must be a number greater than zero" })
    id!: number;
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

    @IsOptional()
    @IsString({ message: "External ID must be a string" })
    externalId?: string;
}

export class UpdateProductDto {
  @IsString()
  name!: string;

  @IsString()
  store!: string;

  @IsString()
  category!: string;

  @IsNumber()
  @IsPositive()
  currentPrice!: number;

  @IsString()
  emoji!: string;

  @IsOptional()
  @IsString()
  externalId?: string;
}

export class ProductSearchDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  store?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "minPrice must be a valid number" })
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "maxPrice must be a valid number" })
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "limit must be an integer" })
  @Min(1, { message: "limit must be greater than zero" })
  @Max(50, { message: "limit must be at most 50" })
  limit?: number;
}

export class ProductTrendingDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "limit must be an integer" })
  @Min(1, { message: "limit must be greater than zero" })
  @Max(50, { message: "limit must be at most 50" })
  limit?: number;
}

export class PriceHistoryQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "days must be an integer" })
  @Min(1, { message: "days must be greater than zero" })
  @Max(365, { message: "days must be at most 365" })
  days?: number;
}

export class RecordPriceSnapshotDto {
  @Type(() => Number)
  @IsNumber({}, { message: "Price must be a number" })
  @IsPositive({ message: "Price must be greater than zero" })
  price!: number;

  @IsOptional()
  @IsString()
  externalId?: string;
}

