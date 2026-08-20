import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsInt, IsOptional, IsString, MaxLength, Min, ValidateNested } from 'class-validator';

class PatternUsageDto {
  @IsString() @MaxLength(30) code!: string;
  @Type(() => Number) @IsInt() @Min(1) quantity!: number;
}

export class CreatePatternDto {
  @IsString() @MaxLength(80) name!: string;
  @Type(() => Number) @IsInt() @Min(1) gridSize!: number;
  @Type(() => Number) @IsInt() @Min(1) colorLimit!: number;
  @Type(() => Number) @IsInt() @Min(1) totalBeads!: number;
  @Type(() => Number) @IsInt() @Min(1) colorCount!: number;
  @IsOptional() @IsString() sourcePath?: string;
  @IsArray() @ArrayMaxSize(221) @ValidateNested({ each: true }) @Type(() => PatternUsageDto) usages!: PatternUsageDto[];
}
