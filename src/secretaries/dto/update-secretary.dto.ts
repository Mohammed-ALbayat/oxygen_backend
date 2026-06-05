import { IsOptional, IsString } from 'class-validator';

export class UpdateSecretaryDto {
  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  shift_start?: string;

  @IsOptional()
  @IsString()
  shift_end?: string;
}
