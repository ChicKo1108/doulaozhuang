import { Type } from 'class-transformer';
import { IsHexColor, IsIn, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';
import { INVENTORY_SORT_VALUES, InventorySort } from './inventory-overview.dto';

export class InventoryQueryDto {
  @IsOptional()
  @IsIn(INVENTORY_SORT_VALUES)
  sort: InventorySort = 'code_asc';
}

export class CreateInventoryItemDto {
  @IsString() @MinLength(1) @MaxLength(30) brand!: string;
  @IsString() @MinLength(1) @MaxLength(30) paletteName!: string;
  @IsString() @MinLength(1) @MaxLength(30) code!: string;
  @IsHexColor() hex!: string;
  @Type(() => Number) @IsInt() @Min(0) quantity!: number;
}

export class UpdateInventoryQuantityDto {
  @Type(() => Number) @IsInt() @Min(0) quantity!: number;
}

export class InitializeInventoryKitDto {
  @Type(() => Number) @IsInt() @IsIn([24, 48, 72, 96, 120, 221]) colorCount!: number;
  @Type(() => Number) @IsInt() @Min(0) quantity!: number;
}
