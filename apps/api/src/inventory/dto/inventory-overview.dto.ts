import { Type } from 'class-transformer';
import { IsArray, IsHexColor, IsIn, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export const INVENTORY_SORT_VALUES = ['code_asc', 'code_desc', 'quantity_asc', 'quantity_desc'] as const;
export type InventorySort = (typeof INVENTORY_SORT_VALUES)[number];

export class InventoryItemDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  brand!: string;

  @IsString()
  paletteName!: string;

  @IsString()
  code!: string;

  @IsHexColor()
  hex!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantity!: number;
}

export class InventoryOverviewDto {
  @IsOptional()
  @IsIn(INVENTORY_SORT_VALUES)
  sort: InventorySort = 'code_asc';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InventoryItemDto)
  items!: InventoryItemDto[];
}
