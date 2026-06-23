import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from "class-validator";
import { Type } from "class-transformer";

export class ExternalProductSearchDto {
    @IsString({ message: "Search query is required" })
    @IsNotEmpty({ message: "Search query cannot be empty" })
    q!: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: "limit must be an integer" })
    @Min(1, { message: "limit must be greater than zero" })
    @Max(20, { message: "limit must be at most 20" })
    limit?: number;
}

export class ImportExternalProductsDto {
    @IsString({ message: "Search query is required" })
    @IsNotEmpty({ message: "Search query cannot be empty" })
    q!: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: "limit must be an integer" })
    @Min(1, { message: "limit must be greater than zero" })
    @Max(20, { message: "limit must be at most 20" })
    limit?: number;
}
