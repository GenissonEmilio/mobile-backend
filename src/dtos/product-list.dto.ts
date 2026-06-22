import { IsOptional, IsString, IsNumber } from "class-validator";
import { Type } from "class-transformer";

export class ProductListDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    store?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: "minPrice must be a valid number"})
    minPrice?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: "maxPrice must be a valid number"})
    maxPrice?: number;
}