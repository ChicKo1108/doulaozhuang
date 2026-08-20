import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateVaultDto {
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  name!: string;
}

export class UpdateVaultDto extends CreateVaultDto {}
